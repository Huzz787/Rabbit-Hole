import { z } from "zod";
import { ai } from "./client";
import { EXPLORATION_PREVIEWS } from "@/lib/data/curatedTopics";

// Zod schema for individual related topic connection
export const RelatedTopicSchema = z.object({
  title: z.string().min(1),
  relationship: z.string().default("Connected Frontier"),
  category: z.string().default("General"),
  summary: z.string().default(""),
});

// Zod schema for validating structured topic expansion
export const TopicExpansionSchema = z.object({
  title: z.string().min(1),
  category: z.string().default("Cosmic Frontier"),
  description: z.string().default(""),
  summary: z.string().min(1),
  facts: z.array(z.string()).default([]),
  exploreNext: z.array(z.string()).default([]),
  relatedTopics: z.array(RelatedTopicSchema).min(3).max(10),
});

export type TopicExpansionResult = z.infer<typeof TopicExpansionSchema>;

// Primary fast model optimized for low latency and high availability
const PRIMARY_MODEL = "gemini-3.5-flash-lite";

// Bounded timeouts for serverless execution: prevents requests from hanging for minutes
const PER_ATTEMPT_TIMEOUT_MS = 4000;
const MAX_TOTAL_GEMINI_TIME_MS = 5500;

/**
 * Builds the fallback expansion result deterministically.
 * Guarantees a rich, schema-compliant discovery in 0ms without external API dependencies.
 */
export function buildCuratedFallback(
  topicTitle: string,
  existingConnectionTitles: string[] = []
): TopicExpansionResult {
  const slug = topicTitle.toLowerCase().replace(/\s+/g, "-");
  const curated = EXPLORATION_PREVIEWS[slug];

  const candidateRelated = curated?.relatedNodes || [
    "Quantum Entanglement",
    "Information Theory",
    "Cosmic Inflation",
    "Bostrom's Trilemma",
    "Event Horizons",
    "Entropy and Time",
    "Neural Complexity",
  ];

  // Filter out existing connections to prevent duplicates
  const existingSet = new Set(existingConnectionTitles.map((t) => t.toLowerCase()));
  const filtered = candidateRelated.filter((title) => !existingSet.has(title.toLowerCase()));

  // Dynamically augment with domain frontiers if existing connections already saturated the primary list
  const pool = [...filtered];
  const frontierExtensions = [
    "Holographic Principle",
    "Thermodynamic Entropy",
    "Information Geometry",
    "Quantum Foam",
    "Non-Equilibrium Dynamics",
    "Emergent Gravity",
    "Topological Matter",
    "String Theory Landscapes",
    "Cosmic Topology",
    "Quantum Decoherence",
  ];

  for (const ext of frontierExtensions) {
    if (pool.length >= 6) break;
    if (!existingSet.has(ext.toLowerCase()) && !pool.some((p) => p.toLowerCase() === ext.toLowerCase())) {
      pool.push(ext);
    }
  }

  const fallbackRelated = pool.slice(0, 7).map((title) => ({
    title,
    relationship: "Interconnected Frontier",
    category: curated?.category || "Cosmic Frontier",
    summary: `Exploring the unexpected theoretical bridges between ${topicTitle} and ${title}.`,
  }));

  return {
    title: topicTitle,
    category: curated?.category || "Cosmic Frontier",
    description: `A frontier inquiry into ${topicTitle} and its unexpected implications across physical and philosophical boundaries.`,
    summary:
      curated?.summary ||
      `Exploration of ${topicTitle} reveals profound intersections between physical reality, consciousness, and computational information.`,
    facts: [
      `${topicTitle} challenges classical assumptions about how spacetime, entropy, and information behave.`,
      `Observational breakthroughs continue to reveal anomalous dynamics at the frontier of ${topicTitle}.`,
      `Theoretical models suggest ${topicTitle} may hold the key to unifying quantum mechanics and gravity.`,
    ],
    exploreNext: [
      `What happens to quantum information at the extreme boundaries of ${topicTitle}?`,
      `How does an observer's frame of reference transform understanding of ${topicTitle}?`,
      `Could ${topicTitle} be an emergent manifestation of holographic spacetime?`,
    ],
    relatedTopics: fallbackRelated.slice(0, 7),
  };
}

/**
 * Expands a topic using Google Gemini API or curated fallback.
 * Employs strict per-attempt timeouts, bounded retries on 503, and structured timing logs.
 */
export async function expandTopicWithGemini(
  topicTitle: string,
  existingConnectionTitles: string[] = []
): Promise<TopicExpansionResult> {
  const globalStart = performance.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && !apiKey.startsWith("your_") && apiKey.length > 10) {
    const existingListStr =
      existingConnectionTitles.length > 0
        ? existingConnectionTitles.join(", ")
        : "none";

    const prompt = `You are the knowledge synthesis engine for "The Rabbit Hole", an interactive curiosity and knowledge discovery platform.
Expand the topic: "${topicTitle}".

Generate structured JSON containing:
1. "title": Exact or polished name of the topic.
2. "category": A compelling domain name (e.g. Astrophysics, Quantum Mechanics, Epistemology, Consciousness, Bio-Engineering, Ancient Mysteries, Cybernetics, Philosophy).
3. "description": A clear 1-2 sentence overview of this subject.
4. "summary": A fascinating, concise explanation highlighting deep paradoxes, frontier questions, or profound implications.
5. "facts": An array of 3 mind-bending, verified facts about this topic.
6. "exploreNext": An array of 3 intriguing questions or thought-provoking rabbit hole threads to explore next.
7. "relatedTopics": An array of 5 to 7 deeply connected topics that a curious explorer should branch into next.
   For each related topic, include:
   - "title": Name of the connected concept.
   - "relationship": A short phrase describing how it deeply interlinks with "${topicTitle}".
   - "category": Domain name.
   - "summary": A concise 1-sentence teaser of this connected concept.

Do NOT include any of these already connected topics: ${existingListStr}.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "${topicTitle}",
  "category": "Domain",
  "description": "Clear overview",
  "summary": "Fascinating concise explanation...",
  "facts": ["Fact 1", "Fact 2", "Fact 3"],
  "exploreNext": ["Question 1?", "Question 2?", "Question 3?"],
  "relatedTopics": [
    {
      "title": "Concept Name",
      "relationship": "How they connect",
      "category": "Domain",
      "summary": "Brief teaser"
    }
  ]
}`;

    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const elapsedSoFar = performance.now() - globalStart;
      const remainingTime = MAX_TOTAL_GEMINI_TIME_MS - elapsedSoFar;

      if (remainingTime < 1500) {
        console.warn(`[Gemini] Remaining time budget (${Math.round(remainingTime)}ms) too low for another attempt; triggering fallback.`);
        break;
      }

      const attemptTimeout = Math.min(PER_ATTEMPT_TIMEOUT_MS, remainingTime);
      const attemptStart = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), attemptTimeout);

      try {
        console.log(`[Gemini] Starting attempt ${attempt}/${maxAttempts} for "${topicTitle}" (model: ${PRIMARY_MODEL}, timeout: ${Math.round(attemptTimeout)}ms)`);

        const response = await ai.models.generateContent({
          model: PRIMARY_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            abortSignal: controller.signal,
          },
        });

        clearTimeout(timer);
        const attemptMs = Math.round(performance.now() - attemptStart);
        const responseText = response.text;

        if (responseText) {
          const zodStart = performance.now();
          const parsedJson = JSON.parse(responseText);
          const validated = TopicExpansionSchema.safeParse(parsedJson);
          const zodMs = Math.round(performance.now() - zodStart);

          if (validated.success) {
            const totalMs = Math.round(performance.now() - globalStart);
            console.log(`[Gemini] SUCCESS for "${topicTitle}" in ${totalMs}ms (API: ${attemptMs}ms, Zod: ${zodMs}ms)`);
            return validated.data;
          } else {
            console.warn(`[Gemini] Response failed Zod validation:`, validated.error.issues);
          }
        }
      } catch (err: unknown) {
        clearTimeout(timer);
        const attemptMs = Math.round(performance.now() - attemptStart);
        const isAbort = err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
        const msg = err instanceof Error ? err.message : String(err);
        const status = (err as { status?: number }).status;

        console.warn(`[Gemini] Attempt ${attempt} failed in ${attemptMs}ms: ${isAbort ? "TIMED OUT" : `status ${status || msg}`}`);

        // Do not retry on client-side abort or unrecoverable auth/not-found errors
        if (isAbort || status === 401 || status === 403 || status === 404) {
          break;
        }

        // Brief delay before retry on transient 503 or 429
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    }
  }

  const fallbackStart = performance.now();
  const fallback = buildCuratedFallback(topicTitle, existingConnectionTitles);
  const fallbackMs = Math.round(performance.now() - fallbackStart);
  const totalMs = Math.round(performance.now() - globalStart);

  console.log(`[Gemini] Returned curated fallback for "${topicTitle}" in ${totalMs}ms (fallback gen: ${fallbackMs}ms)`);
  return fallback;
}
