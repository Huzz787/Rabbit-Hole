import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeConnectionError, withQueryTimeout } from "@/lib/database/prisma";
import { z } from "zod";

const CreateTopicSchema = z.object({
  title: z.string().min(1, "Topic title is required"),
  category: z.string().optional().default("General"),
  description: z.string().optional(),
  summary: z.string().optional(),
  depth: z.number().int().nonnegative().optional().default(1),
});

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        topics: [],
        message: "DATABASE_URL not configured",
      });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    const topics = await withQueryTimeout(
      () =>
        prisma.topic.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            _count: {
              select: {
                outgoingConnections: true,
                incomingConnections: true,
                savedDiscoveries: true,
              },
            },
          },
        }),
      3500,
      []
    );

    return NextResponse.json({ topics, count: topics.length });
  } catch (err) {
    return NextResponse.json(
      { error: sanitizeConnectionError(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured in environment." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const validated = CreateTopicSchema.parse(body);

    const topic = await withQueryTimeout(
      () =>
        prisma.topic.upsert({
          where: { title: validated.title },
          create: {
            title: validated.title,
            name: validated.title,
            category: validated.category,
            description: validated.description,
            summary: validated.summary,
            depth: validated.depth,
          },
          update: {
            category: validated.category,
            description: validated.description || undefined,
            summary: validated.summary || undefined,
          },
        }),
      3500,
      null
    );

    if (!topic) {
      return NextResponse.json(
        { error: "Database operation timed out." },
        { status: 504 }
      );
    }

    return NextResponse.json({ topic });
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
