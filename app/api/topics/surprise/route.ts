import { NextResponse } from "next/server";
import { prisma, sanitizeConnectionError } from "@/lib/database/prisma";
import { EXPLORATION_PREVIEWS } from "@/lib/data/curatedTopics";

const CURATED_TITLES = [
  "Black Holes",
  "Quantum Computing",
  "The Simulation Hypothesis",
  "Psychology of Dreams",
  "Lost Civilizations",
  "The Fermi Paradox",
];

export async function GET() {
  const start = performance.now();

  try {
    if (process.env.DATABASE_URL) {
      // Find up to 25 topics that already have summaries and connections
      const candidateTopics = await prisma.topic.findMany({
        where: {
          summary: { not: null },
        },
        select: {
          id: true,
          title: true,
          category: true,
          summary: true,
        },
        take: 25,
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (candidateTopics.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateTopics.length);
        const selected = candidateTopics[randomIndex];
        const ms = Math.round(performance.now() - start);

        console.log(`[Surprise Me] Selected DB topic "${selected.title}" in ${ms}ms`);
        return NextResponse.json({
          title: selected.title,
          category: selected.category || "Cosmic Frontier",
          summary: selected.summary,
          source: "database",
          latencyMs: ms,
        });
      }
    }
  } catch (err) {
    console.warn("[Surprise Me] DB lookup fallback:", sanitizeConnectionError(err));
  }

  // Fast curated fallback
  const randomTitle = CURATED_TITLES[Math.floor(Math.random() * CURATED_TITLES.length)];
  const slug = randomTitle.toLowerCase().replace(/\s+/g, "-");
  const curated = EXPLORATION_PREVIEWS[slug];
  const ms = Math.round(performance.now() - start);

  console.log(`[Surprise Me] Selected curated topic "${randomTitle}" in ${ms}ms`);
  return NextResponse.json({
    title: randomTitle,
    category: curated?.category || "Cosmic Frontier",
    summary: curated?.summary || "",
    source: "curated",
    latencyMs: ms,
  });
}
