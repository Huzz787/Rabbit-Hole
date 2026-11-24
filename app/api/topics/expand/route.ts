import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeConnectionError } from "@/lib/database/prisma";
import { expandTopicWithGemini } from "@/lib/gemini/service";
import { extractServerSessionId } from "@/lib/utils/serverSession";
import { z } from "zod";

// Input validation schema with length constraints
const ExpandRequestSchema = z.object({
  topicTitle: z
    .string()
    .trim()
    .min(1, "topicTitle is required")
    .max(100, "topicTitle cannot exceed 100 characters"),
  sessionId: z.string().trim().max(100).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

// Sliding window rate limiter (max 40 requests per minute per IP / Session)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicTitle, sessionId: rawSessionId, forceRefresh } = ExpandRequestSchema.parse(body);
    const sessionId = extractServerSessionId(req, rawSessionId);

    // Rate limiting check based on client IP or sessionId
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || sessionId;
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit reached (40 req/min). Please wait a moment before expanding more topics." },
        { status: 429 }
      );
    }

    // If database connection is absent, return standalone Gemini expansion with offline status
    if (!process.env.DATABASE_URL) {
      const expansion = await expandTopicWithGemini(topicTitle, []);
      return NextResponse.json({
        source: "offline-fallback",
        databaseStatus: "offline",
        warning: "Database is offline. Discoveries and graph nodes are temporary and not saved permanently.",
        topic: {
          id: `virtual-${Date.now()}`,
          title: expansion.title,
          category: expansion.category,
          description: expansion.description,
          summary: expansion.summary,
        },
        expansion,
        connections: expansion.relatedTopics.map((rt) => ({
          targetTopic: {
            id: `virtual-${rt.title.toLowerCase().replace(/\s+/g, "-")}`,
            title: rt.title,
            category: rt.category,
            summary: rt.summary,
          },
          relationship: rt.relationship,
        })),
      });
    }

    try {
      // 1. Find or create the root topic in Aiven PostgreSQL
      const rootTopic = await prisma.topic.upsert({
        where: { title: topicTitle },
        create: {
          title: topicTitle,
          name: topicTitle,
          category: "Cosmic Frontier",
          depth: 1,
        },
        update: {},
        include: {
          outgoingConnections: {
            include: { targetTopic: true },
          },
          incomingConnections: {
            include: { sourceTopic: true },
          },
        },
      });

      // 2. Collect existing connected titles
      const existingOutgoing = rootTopic.outgoingConnections.map((c) => ({
        targetTopic: c.targetTopic,
        relationship: c.relationship,
      }));
      const existingIncoming = rootTopic.incomingConnections.map((c) => ({
        targetTopic: c.sourceTopic,
        relationship: c.relationship,
      }));
      const allExisting = [...existingOutgoing, ...existingIncoming];
      const existingTitles = allExisting.map((c) => c.targetTopic.title);

      // Caching: If topic already has rich description & summary and >= 5 connections and not force refreshed, return cached
      if (!forceRefresh && rootTopic.summary && existingTitles.length >= 5) {
        // Record exploration step in history
        if (sessionId) {
          await prisma.explorationHistory.create({
            data: { sessionId, topicId: rootTopic.id },
          });
        }

        return NextResponse.json({
          source: "aiven-cached",
          databaseStatus: "connected",
          rootTopic,
          expansion: {
            title: rootTopic.title,
            category: rootTopic.category || "Cosmic Frontier",
            description: rootTopic.description || "",
            summary: rootTopic.summary || "",
            facts: [
              `${rootTopic.title} sits at the crossroad of fundamental theory and observational unknowns.`,
              `Deep inquiry into ${rootTopic.title} consistently reveals nonlinear relationships across physical paradigms.`,
              `Theoretical perspectives on ${rootTopic.title} challenge conventional boundary assumptions.`,
            ],
            exploreNext: [
              `What hidden constraints govern ${rootTopic.title}?`,
              `How does observer frame alter our definition of ${rootTopic.title}?`,
            ],
            relatedTopics: allExisting.map((c) => ({
              title: c.targetTopic.title,
              relationship: c.relationship || "Connected Frontier",
              category: c.targetTopic.category || "General",
              summary: c.targetTopic.summary || "",
            })),
          },
          createdCount: 0,
          connections: allExisting,
          newGraphNodes: allExisting.map((c) => ({
            id: c.targetTopic.id,
            name: c.targetTopic.title,
            val: 8,
            group: c.targetTopic.category || "General",
            summary: c.targetTopic.summary,
            depth: c.targetTopic.depth,
          })),
          newGraphLinks: allExisting.map((c) => ({
            source: rootTopic.id,
            target: c.targetTopic.id,
            relationship: c.relationship,
            value: 1,
          })),
        });
      }

      // 3. Generate structured expansion using Gemini (or curated fallback)
      const expansion = await expandTopicWithGemini(topicTitle, existingTitles);

      // Update root topic details
      const updatedRootTopic = await prisma.topic.update({
        where: { id: rootTopic.id },
        data: {
          category: expansion.category || rootTopic.category,
          description: expansion.description || rootTopic.description,
          summary: expansion.summary || rootTopic.summary,
        },
      });

      // 4. Save newly discovered topics and connect them in Aiven PostgreSQL
      const createdConnections = [];
      const newGraphNodes = [];
      const newGraphLinks = [];

      for (const rel of expansion.relatedTopics) {
        // Upsert target topic in Aiven
        const targetTopic = await prisma.topic.upsert({
          where: { title: rel.title },
          create: {
            title: rel.title,
            name: rel.title,
            category: rel.category,
            summary: rel.summary,
            depth: (rootTopic.depth || 1) + 1,
          },
          update: {
            category: rel.category,
            summary: rel.summary || undefined,
          },
        });

        // Avoid self-connections
        if (targetTopic.id !== rootTopic.id) {
          // Upsert connection to prevent duplicates
          const connection = await prisma.topicConnection.upsert({
            where: {
              sourceTopicId_targetTopicId: {
                sourceTopicId: rootTopic.id,
                targetTopicId: targetTopic.id,
              },
            },
            create: {
              sourceTopicId: rootTopic.id,
              targetTopicId: targetTopic.id,
              relationship: rel.relationship || "Connected Frontier",
              weight: 1.0,
            },
            update: {
              relationship: rel.relationship || undefined,
            },
          });

          createdConnections.push({
            connection,
            targetTopic,
            relationship: rel.relationship,
          });

          newGraphNodes.push({
            id: targetTopic.id,
            name: targetTopic.title,
            val: 8,
            group: targetTopic.category || "General",
            summary: targetTopic.summary || rel.summary,
            depth: targetTopic.depth,
          });

          newGraphLinks.push({
            source: rootTopic.id,
            target: targetTopic.id,
            relationship: rel.relationship,
            value: 1,
          });
        }
      }

      // 5. Record exploration step in history
      if (sessionId) {
        await prisma.explorationHistory.create({
          data: {
            sessionId,
            topicId: rootTopic.id,
          },
        });
      }

      return NextResponse.json({
        source: "aiven",
        databaseStatus: "connected",
        rootTopic: updatedRootTopic,
        expansion,
        createdCount: createdConnections.length,
        connections: createdConnections,
        newGraphNodes,
        newGraphLinks,
      });
    } catch (dbErr) {
      console.warn("Database operation during expansion encountered an issue, returning Gemini expansion:", sanitizeConnectionError(dbErr));
      // Graceful fallback to pure Gemini response if Aiven query fails
      const expansion = await expandTopicWithGemini(topicTitle, []);
      return NextResponse.json({
        source: "offline-fallback",
        databaseStatus: "offline",
        warning: "Database is offline. Generated topics are temporary and not saved permanently.",
        topic: {
          id: `virtual-${Date.now()}`,
          title: expansion.title,
          category: expansion.category,
          description: expansion.description,
          summary: expansion.summary,
        },
        expansion,
        connections: expansion.relatedTopics.map((rt) => ({
          targetTopic: {
            id: `virtual-${rt.title.toLowerCase().replace(/\s+/g, "-")}`,
            title: rt.title,
            category: rt.category,
            summary: rt.summary,
          },
          relationship: rt.relationship,
        })),
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: sanitizeConnectionError(err) },
      { status: 500 }
    );
  }
}
