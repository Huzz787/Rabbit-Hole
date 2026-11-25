import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeConnectionError } from "@/lib/database/prisma";
import {
  expandTopicWithGemini,
  GeminiExpansionOutput,
} from "@/lib/gemini/service";
import { getCuratedTopic } from "@/lib/data/curatedTopics";
import { extractServerSessionId } from "@/lib/utils/serverSession";
import { z } from "zod";

// Vercel serverless function maximum execution duration limit
export const maxDuration = 15;

// Input validation schema with length constraints
const ExpandRequestSchema = z.object({
  topicTitle: z
    .string()
    .trim()
    .min(1, "topicTitle is required")
    .max(100, "topicTitle cannot exceed 100 characters"),
  sessionId: z.string().trim().max(100).optional(),
  forceRefresh: z.boolean().optional().default(false),
  clientTimestamp: z.number().optional(),
});

// Sliding window rate limiter (max 60 requests per minute per IP / Session)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
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

// In-memory cache for expanded topic payloads to guarantee sub-millisecond warm responses
interface CachedExpansionPayload {
  payload: Record<string, unknown>;
  timestamp: number;
}
const TOPIC_CACHE = new Map<string, CachedExpansionPayload>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const MAX_CACHE_ENTRIES = 300;

// Request coalescing map to prevent duplicate simultaneous generation for the exact same topic
const inFlightExpansions = new Map<string, Promise<GeminiExpansionOutput>>();

// Safe database timeout wrapper
/**
 * Safe database timeout wrapper.
 * NOTE: Promise.race bounds JavaScript execution wait time in Node.js;
 * it does NOT cancel the underlying PostgreSQL query over the wire/TCP connection.
 * We attach a suppressed catch handler to the database promise so that any post-timeout
 * query rejections or network errors are cleanly caught and cannot trigger
 * unhandled promise rejections in Node.js.
 */
async function withDbTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 3000,
  fallback: T
): Promise<T> {
  // Prevent unhandled promise rejections if the background database query later fails after timeout
  promise.catch((err) => {
    console.warn("[DB Suppressed Post-Timeout]", sanitizeConnectionError(err));
  });

  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[DB Timeout] Operation exceeded ${timeoutMs}ms; using fallback.`);
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch (err) {
    console.warn("[DB Error]", sanitizeConnectionError(err));
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const routeStart = performance.now();
  let clientStartMs: number | null = null;

  try {
    const body = await req.json();
    const { topicTitle, sessionId: rawSessionId, forceRefresh, clientTimestamp } =
      ExpandRequestSchema.parse(body);
    const sessionId = extractServerSessionId(req, rawSessionId);
    const normalizedKey = topicTitle.toLowerCase().trim();

    if (clientTimestamp && typeof clientTimestamp === "number") {
      clientStartMs = clientTimestamp;
    } else {
      const headerClientTime = req.headers.get("x-request-start");
      if (headerClientTime) {
        clientStartMs = parseInt(headerClientTime, 10) || null;
      }
    }

    // Rate limiting check
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      sessionId ||
      "anon";
    if (!checkRateLimit(clientIp)) {
      console.warn(`[RateLimit] Blocked request from ${clientIp} for "${topicTitle}"`);
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment before expanding more topics." },
        { status: 429 }
      );
    }

    // 1. Check in-memory cache first (instant response for repeat queries; never serve fallback entries)
    if (forceRefresh) {
      TOPIC_CACHE.delete(normalizedKey);
    } else {
      const cached = TOPIC_CACHE.get(normalizedKey);
      const cachedIsFallback = Boolean(
        (cached?.payload?.expansion as { isFallback?: boolean } | undefined)?.isFallback
      );
      if (cached && !cachedIsFallback && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        const cacheHitMs = Math.round(performance.now() - routeStart);
        console.log(`[Cache Hit] Serving "${topicTitle}" from memory in ${cacheHitMs}ms`);

        // Record history step asynchronously without blocking the response
        if (process.env.DATABASE_URL && sessionId && cached.payload.rootTopic) {
          const root = cached.payload.rootTopic as { id: string };
          prisma.explorationHistory
            .create({ data: { sessionId, topicId: root.id } })
            .catch(() => {});
        }

        const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;
        const cachedTelemetry = cached.payload.telemetry as { usedFallback?: boolean } | undefined;
        return NextResponse.json({
          ...cached.payload,
          source: "memory-cache",
          latencyMs: cacheHitMs,
          telemetry: {
            totalApiMs: cacheHitMs,
            frontendRequestDurationMs: frontendDuration,
            dbLookupMs: 0,
            geminiMs: 0,
            geminiAttempts: 0,
            geminiModel: "memory-cache",
            usedFallback: Boolean(cachedTelemetry?.usedFallback),
            dbRootUpdateMs: 0,
            dbRelatedUpsertMs: 0,
          },
        });
      }
    }

    // If database connection is absent, return standalone Gemini expansion with offline status
    if (!process.env.DATABASE_URL) {
      const aiStart = performance.now();
      const expansion = await expandTopicWithGemini(topicTitle, []);
      const aiMs = Math.round(performance.now() - aiStart);
      const totalMs = Math.round(performance.now() - routeStart);
      const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;

      console.log(`[Offline Fallback] Completed "${topicTitle}" in ${totalMs}ms (AI: ${aiMs}ms)`);
      return NextResponse.json({
        source: "offline-fallback",
        databaseStatus: "offline",
        warning:
          "Database is offline. Discoveries and graph nodes are temporary and not saved permanently.",
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
        latencyMs: totalMs,
        telemetry: {
          totalApiMs: totalMs,
          frontendRequestDurationMs: frontendDuration,
          dbLookupMs: 0,
          geminiMs: expansion.timing?.durationMs || aiMs,
          geminiAttempts: expansion.timing?.attempts || 1,
          geminiModel: expansion.timing?.modelUsed || "none",
          usedFallback: expansion.timing?.usedFallback || false,
          dbRootUpdateMs: 0,
          dbRelatedUpsertMs: 0,
        },
      });
    }

    try {
      // 2. Database Lookup: Find or create root topic (with concurrency race handling)
      const dbLookupStart = performance.now();
      const findOrCreateRoot = async () => {
        try {
          return await prisma.topic.upsert({
            where: { title: topicTitle },
            create: {
              title: topicTitle,
              name: topicTitle,
              category: "General Knowledge",
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
        } catch {
          // If concurrent request created topic simultaneously, retrieve it cleanly
          return await prisma.topic.findUnique({
            where: { title: topicTitle },
            include: {
              outgoingConnections: {
                include: { targetTopic: true },
              },
              incomingConnections: {
                include: { sourceTopic: true },
              },
            },
          });
        }
      };

      const rootTopic = await withDbTimeout(findOrCreateRoot(), 1500, null);
      const dbLookupMs = Math.round(performance.now() - dbLookupStart);
      console.log(`[DB Lookup] Root topic lookup for "${topicTitle}" took ${dbLookupMs}ms`);

      if (!rootTopic) {
        throw new Error("Database query timed out during root topic retrieval.");
      }

      // Collect existing connected titles
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

      // Caching check: If topic already has rich details and existing connections, return immediately
      if (!forceRefresh && rootTopic.summary && existingTitles.length >= 5) {
        if (sessionId) {
          prisma.explorationHistory
            .create({ data: { sessionId, topicId: rootTopic.id } })
            .catch(() => {});
        }
        const totalMs = Math.round(performance.now() - routeStart);
        const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;

        // Retrieve curated facts if available to avoid returning generic filler
        const curated = getCuratedTopic(topicTitle);
        const resolvedFacts = curated?.facts || [
          `${rootTopic.title} is a key discovery node with ${existingTitles.length} mapped connections in the knowledge universe.`,
          `Observational and analytical studies continuously refine our understanding of ${rootTopic.title}.`,
          `Interdisciplinary links connect ${rootTopic.title} directly with ${existingTitles.slice(0, 3).join(", ")}.`,
        ];
        const resolvedQuestions = curated?.exploreNext || [
          `What core mechanisms govern the behavior of ${rootTopic.title}?`,
          `How does ${rootTopic.title} link directly with ${existingTitles[0] || "connected domains"}?`,
          `What recent breakthroughs are redefining the landscape of ${rootTopic.title}?`,
        ];

        console.log(`[Aiven Cached] Returning pre-existing node "${topicTitle}" in ${totalMs}ms`);

        const cachedPayload = {
          source: "aiven-cached",
          databaseStatus: "connected",
          rootTopic,
          expansion: {
            title: rootTopic.title,
            category: rootTopic.category || curated?.category || "General Knowledge",
            description: rootTopic.description || curated?.description || "",
            summary: rootTopic.summary || curated?.summary || "",
            facts: resolvedFacts,
            exploreNext: resolvedQuestions,
            relatedTopics: allExisting.map((c) => ({
              title: c.targetTopic.title,
              relationship: c.relationship || "Connected Concept",
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
          latencyMs: totalMs,
          telemetry: {
            totalApiMs: totalMs,
            frontendRequestDurationMs: frontendDuration,
            dbLookupMs,
            geminiMs: 0,
            geminiAttempts: 0,
            geminiModel: "aiven-cached",
            usedFallback: false,
            dbRootUpdateMs: 0,
            dbRelatedUpsertMs: 0,
          },
        };

        // Cache in memory
        TOPIC_CACHE.set(normalizedKey, { payload: cachedPayload, timestamp: Date.now() });
        return NextResponse.json(cachedPayload);
      }

      // 3. AI Generation with Request Coalescing
      const aiStart = performance.now();
      let expansionPromise = inFlightExpansions.get(normalizedKey);
      if (!expansionPromise) {
        expansionPromise = expandTopicWithGemini(topicTitle, existingTitles);
        // Safely detach cleanup handler: .then(cleanup, cleanup) handles both fulfilled and rejected
        // states without creating a detached unhandled rejection promise
        const cleanup = () => {
          inFlightExpansions.delete(normalizedKey);
        };
        expansionPromise.then(cleanup, cleanup);
        inFlightExpansions.set(normalizedKey, expansionPromise);
      }

      let expansion: GeminiExpansionOutput;
      try {
        expansion = await expansionPromise;
      } finally {
        inFlightExpansions.delete(normalizedKey);
      }
      const aiMs = Math.round(performance.now() - aiStart);
      const isFallbackResult = Boolean(expansion.isFallback || expansion.timing?.usedFallback);
      console.log(`[AI Gen] Expansion for "${topicTitle}" took ${aiMs}ms (model: ${expansion.timing?.modelUsed}, fallback: ${isFallbackResult})`);

      // CRITICAL: Never persist fallback-generated content or relationships to Aiven or TOPIC_CACHE
      if (isFallbackResult) {
        if (sessionId) {
          prisma.explorationHistory
            .create({ data: { sessionId, topicId: rootTopic.id } })
            .catch(() => {});
        }

        const totalRouteMs = Math.round(performance.now() - routeStart);
        const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;

        return NextResponse.json({
          source: "fallback",
          databaseStatus: "connected",
          rootTopic,
          expansion,
          createdCount: 0,
          connections: [],
          newGraphNodes: [],
          newGraphLinks: [],
          latencyMs: totalRouteMs,
          telemetry: {
            totalApiMs: totalRouteMs,
            frontendRequestDurationMs: frontendDuration,
            dbLookupMs,
            geminiMs: expansion.timing?.durationMs || aiMs,
            geminiAttempts: expansion.timing?.attempts || 0,
            geminiModel: expansion.timing?.modelUsed || "none",
            usedFallback: true,
            dbRootUpdateMs: 0,
            dbRelatedUpsertMs: 0,
          },
        });
      }

      // 4. Update root topic details with bounded timeout (max 1.2s)
      const updateRootStart = performance.now();
      const updateRootOp = prisma.topic.update({
        where: { id: rootTopic.id },
        data: {
          category: expansion.category || rootTopic.category,
          description: expansion.description || rootTopic.description,
          summary: expansion.summary || rootTopic.summary,
        },
      });
      const updatedRootTopic = (await withDbTimeout(updateRootOp, 1200, rootTopic)) || rootTopic;
      const updateRootMs = Math.round(performance.now() - updateRootStart);

      // 5. Concurrent batch upsert of related topics and connections with bounded timeout
      const batchUpsertStart = performance.now();
      const createdConnections: Array<{
        targetTopic: {
          id: string;
          title: string;
          category: string | null;
          summary: string | null;
          depth: number | null;
        };
        relationship: string;
      }> = [];
      const newGraphNodes: Array<{
        id: string;
        name: string;
        val: number;
        group: string;
        summary: string | null;
        depth: number | null;
      }> = [];
      const newGraphLinks: Array<{
        source: string;
        target: string;
        relationship: string;
        value: number;
      }> = [];

      const connectionPromises = expansion.relatedTopics.map(async (rel) => {
        try {
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

          if (targetTopic.id !== rootTopic.id) {
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
                relationship: rel.relationship || "Connected Concept",
                weight: 1.0,
              },
              update: {
                relationship: rel.relationship || undefined,
              },
            });

            return {
              targetTopic,
              connection,
              relationship: rel.relationship || "Connected Concept",
            };
          }
        } catch (linkErr) {
          console.warn(`[Batch Link] Failed to link "${rel.title}":`, sanitizeConnectionError(linkErr));
        }
        return null;
      });

      const batchResults = await withDbTimeout(Promise.all(connectionPromises), 1800, []);
      for (const res of batchResults) {
        if (res) {
          createdConnections.push({
            targetTopic: res.targetTopic,
            relationship: res.relationship,
          });

          newGraphNodes.push({
            id: res.targetTopic.id,
            name: res.targetTopic.title,
            val: 8,
            group: res.targetTopic.category || "General",
            summary: res.targetTopic.summary,
            depth: res.targetTopic.depth,
          });

          newGraphLinks.push({
            source: rootTopic.id,
            target: res.targetTopic.id,
            relationship: res.relationship,
            value: 1,
          });
        }
      }
      const batchUpsertMs = Math.round(performance.now() - batchUpsertStart);
      console.log(`[Parallel DB Upsert] Linked ${createdConnections.length} nodes in ${batchUpsertMs}ms`);

      // 6. Record exploration step in history asynchronously
      if (sessionId) {
        prisma.explorationHistory
          .create({ data: { sessionId, topicId: rootTopic.id } })
          .catch(() => {});
      }

      const totalRouteMs = Math.round(performance.now() - routeStart);
      const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;

      console.log(
        `[Timing Summary] "${topicTitle}" total: ${totalRouteMs}ms (DB lookup: ${dbLookupMs}ms, AI: ${aiMs}ms [${expansion.timing?.modelUsed}], DB root update: ${updateRootMs}ms, Parallel DB batch: ${batchUpsertMs}ms)`
      );

      const finalResponse = {
        source: "aiven",
        databaseStatus: "connected",
        rootTopic: updatedRootTopic,
        expansion,
        createdCount: createdConnections.length,
        connections: createdConnections,
        newGraphNodes,
        newGraphLinks,
        latencyMs: totalRouteMs,
        telemetry: {
          totalApiMs: totalRouteMs,
          frontendRequestDurationMs: frontendDuration,
          dbLookupMs,
          geminiMs: expansion.timing?.durationMs || aiMs,
          geminiAttempts: expansion.timing?.attempts || 1,
          geminiModel: expansion.timing?.modelUsed || "none",
          usedFallback: expansion.timing?.usedFallback || false,
          dbRootUpdateMs: updateRootMs,
          dbRelatedUpsertMs: batchUpsertMs,
        },
      };

      // Store in memory cache
      if (TOPIC_CACHE.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = TOPIC_CACHE.keys().next().value;
        if (oldestKey) TOPIC_CACHE.delete(oldestKey);
      }
      TOPIC_CACHE.set(normalizedKey, { payload: finalResponse, timestamp: Date.now() });

      return NextResponse.json(finalResponse);
    } catch (dbErr) {
      console.warn("[DB Fallback] Database issue during expansion:", sanitizeConnectionError(dbErr));

      // Fast fallback to Gemini expansion if Aiven connection has issues
      const expansion = await expandTopicWithGemini(topicTitle, []);
      const totalRouteMs = Math.round(performance.now() - routeStart);
      const frontendDuration = clientStartMs ? Math.round(Date.now() - clientStartMs) : null;

      return NextResponse.json({
        source: "offline-fallback",
        databaseStatus: "offline",
        warning:
          "Database is temporarily slow or offline. Generated topics are temporary and not saved permanently.",
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
        latencyMs: totalRouteMs,
        telemetry: {
          totalApiMs: totalRouteMs,
          frontendRequestDurationMs: frontendDuration,
          dbLookupMs: 0,
          geminiMs: expansion.timing?.durationMs || 0,
          geminiAttempts: expansion.timing?.attempts || 1,
          geminiModel: expansion.timing?.modelUsed || "none",
          usedFallback: expansion.timing?.usedFallback || false,
          dbRootUpdateMs: 0,
          dbRelatedUpsertMs: 0,
        },
      });
    }
  } catch (err) {
    const errorMs = Math.round(performance.now() - routeStart);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(`[API Error] /api/topics/expand error after ${errorMs}ms:`, sanitizeConnectionError(err));
    return NextResponse.json(
      { error: sanitizeConnectionError(err) },
      { status: 500 }
    );
  }
}
