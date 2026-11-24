import { NextRequest, NextResponse } from "next/server";
import { prisma, sanitizeConnectionError, withQueryTimeout } from "@/lib/database/prisma";
import { extractServerSessionId } from "@/lib/utils/serverSession";
import { z } from "zod";

const RecordHistorySchema = z.object({
  sessionId: z.string().optional(),
  topicId: z.string().min(1, "topicId is required"),
});

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { history: [], source: "offline", error: "Database offline" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawSessionId = searchParams.get("sessionId");
    const sessionId = extractServerSessionId(req, rawSessionId);

    const history = await withQueryTimeout(
      () =>
        prisma.explorationHistory.findMany({
          where: { sessionId },
          orderBy: { exploredAt: "desc" },
          take: 50,
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                category: true,
                summary: true,
              },
            },
          },
        }),
      3500,
      []
    );

    return NextResponse.json({ history, count: history.length, sessionId });
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
        { error: "DATABASE_URL not configured. Cannot record history while offline." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { sessionId: rawSessionId, topicId } = RecordHistorySchema.parse(body);
    const sessionId = extractServerSessionId(req, rawSessionId);

    const record = await withQueryTimeout(
      () =>
        prisma.explorationHistory.create({
          data: {
            sessionId,
            topicId,
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
        { error: "Database history recording timed out." },
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
