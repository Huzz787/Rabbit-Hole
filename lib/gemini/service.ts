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

// Resilient list of Gemini models in order of latency and availability
const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

/**
 * Expands a topic using Google Gemini API or curated fallback.
 * Checks existing connection titles to avoid generating redundant relationships.
 */
export async function expandTopicWithGemini(
  topicTitle: string,
  existingConnectionTitles: string[] = []
): Promise<TopicExpansionResult> {
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
5. "facts": An array of 3-4 mind-bending, verified facts about this topic.
6. "exploreNext": An array of 3-4 intriguing questions or thought-provoking rabbit hole threads to explore next.
7. "relatedTopics": An array of 5 to 8 deeply connected topics that a curious explorer should branch into next.
   For each related topic, include:
   - "title": Name of the connected concept.
   - "relationship": A short phrase describing how it deeply interlinks with "${topicTitle}" (e.g. "Cosmological Boundary", "Thermodynamic Limit", "Observer Paradox").
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

    for (const model of GEMINI_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text;
        if (responseText) {
          const parsedJson = JSON.parse(responseText);
          const validated = TopicExpansionSchema.safeParse(parsedJson);
          if (validated.success) {
            return validated.data;
          }
        }
      } catch (err: unknown) {
        // Continue to fallback model on temporary quota or demand errors
        const msg = err instanceof Error ? err.message : String(err);
        const isTemporary = msg.includes("503") || msg.includes("429");
        if (!isTemporary) {
          console.warn(`Gemini model ${model} error:`, msg);
        }
      }
    }
  }

  // Graceful offline fallback using curated knowledge base
  const slug = topicTitle.toLowerCase().replace(/\s+/g, "-");
  const curated = EXPLORATION_PREVIEWS[slug];

  const candidateRelated = curated?.relatedNodes || [
    "Quantum Entanglement",
    "Information Theory",
    "Cosmic Inflation",
    "Bostrom's Trilemma",
    "Event Horizons",
    "Entropy and Time",
  ];

  // Filter out existing connections to prevent duplicates
  const existingSet = new Set(existingConnectionTitles.map((t) => t.toLowerCase()));
  const filtered = candidateRelated.filter((title) => !existingSet.has(title.toLowerCase()));

  const fallbackRelated = (filtered.length >= 3 ? filtered : candidateRelated).map((title) => ({
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
