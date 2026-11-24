import { NextResponse } from "next/server";
import { prisma, sanitizeConnectionError } from "@/lib/database/prisma";
import { SAMPLE_KNOWLEDGE_GRAPH } from "@/lib/data/sampleKnowledgeGraph";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        ...SAMPLE_KNOWLEDGE_GRAPH,
        source: "fallback",
        message: "Aiven DATABASE_URL not configured. Using pre-synthesized constellation.",
      });
    }

    const topics = await prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
    });

    if (topics.length === 0) {
      return NextResponse.json({
        ...SAMPLE_KNOWLEDGE_GRAPH,
        source: "fallback",
        message: "No topics recorded in Aiven database yet. Using sample constellation.",
      });
    }

    const topicIds = topics.map((t) => t.id);
    const connections = await prisma.topicConnection.findMany({
      where: {
        sourceTopicId: { in: topicIds },
        targetTopicId: { in: topicIds },
      },
    });

    const nodes = topics.map((t) => ({
      id: t.id,
      name: t.title,
      category: t.category || "General",
      group: t.category || "General",
      summary: t.summary || t.description || "",
      val: t.depth === 0 ? 24 : Math.max(10, 18 - (t.depth || 1) * 2),
      depth: t.depth,
    }));

    const links = connections.map((c) => ({
      source: c.sourceTopicId,
      target: c.targetTopicId,
      relationship: c.relationship || "Connected",
      value: c.weight,
    }));

    return NextResponse.json({
      nodes,
      links,
      source: "aiven",
      count: nodes.length,
    });
  } catch (err) {
    return NextResponse.json({
      ...SAMPLE_KNOWLEDGE_GRAPH,
      source: "fallback",
      error: sanitizeConnectionError(err),
    });
  }
}
