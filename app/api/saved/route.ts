import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeConnectionError, withQueryTimeout } from "@/lib/database/prisma";
import { extractServerSessionId } from "@/lib/utils/serverSession";
import { z } from "zod";

const SaveDiscoverySchema = z.object({
  sessionId: z.string().optional(),
  topicId: z.string().min(1, "topicId is required"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { saved: [], source: "offline", error: "Database offline" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawSessionId = searchParams.get("sessionId");
    const sessionId = extractServerSessionId(req, rawSessionId);

    const saved = await withQueryTimeout(
      () =>
        prisma.savedDiscoveries.findMany({
          where: { sessionId },
          orderBy: { savedAt: "desc" },
          take: 50,
          include: {
            topic: true,
          },
        }),
      3500,
      []
    );

    return NextResponse.json({ saved, count: saved.length, sessionId });
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
        { error: "DATABASE_URL not configured. Cannot save permanently while offline." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { sessionId: rawSessionId, topicId, notes } = SaveDiscoverySchema.parse(body);
    const sessionId = extractServerSessionId(req, rawSessionId);

    const record = await withQueryTimeout(
      () =>
        prisma.savedDiscoveries.upsert({
          where: {
            sessionId_topicId: {
              sessionId,
              topicId,
            },
          },
          create: {
            sessionId,
            topicId,
            notes,
          },
          update: {
            notes: notes || undefined,
          },
          include: {
            topic: true,
          },
        }),
      3500,
      null
    );

    if (!record) {
      return NextResponse.json(
        { error: "Database save operation timed out." },
        { status: 504 }
      );
    }

    return NextResponse.json({ record });
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

export async function DELETE(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured. Cannot delete while offline." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawSessionId = searchParams.get("sessionId");
    const topicId = searchParams.get("topicId");
    const sessionId = extractServerSessionId(req, rawSessionId);

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId is a required query parameter." },
        { status: 400 }
      );
    }

    await withQueryTimeout(
      () =>
        prisma.savedDiscoveries.deleteMany({
          where: {
            sessionId,
            topicId,
          },
        }),
      3500,
      null
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: sanitizeConnectionError(err) },
      { status: 500 }
    );
  }
}
