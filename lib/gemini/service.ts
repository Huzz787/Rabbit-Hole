import { z } from "zod";
import { ai } from "./client";
import { getCuratedTopic } from "@/lib/data/curatedTopics";

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
  category: z.string().default("General Knowledge"),
  description: z.string().default(""),
  summary: z.string().min(1),
  facts: z.array(z.string()).default([]),
  exploreNext: z.array(z.string()).default([]),
  relatedTopics: z.array(RelatedTopicSchema).max(10).default([]),
  isFallback: z.boolean().optional().default(false),
  fallbackReason: z.string().optional(),
});

export type TopicExpansionResult = z.infer<typeof TopicExpansionSchema>;

export interface GeminiExpansionOutput extends TopicExpansionResult {
  timing: {
    durationMs: number;
    attempts: number;
    modelUsed: string;
    usedFallback: boolean;
  };
}

// Resilient priority order of verified operational models
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
];

// Coordinated request budget within Vercel maxDuration = 15s:
// - Worst-case Aiven DB timeouts in /api/topics/expand: 1500ms (lookup) + 1200ms (root update) + 1800ms (batch upsert) = 4500ms
// - Serialization + handler overhead: ~100ms
// - Remaining AI budget: 8500ms -> worst-case backend = 13,100ms (1,900ms headroom under 15,000ms Vercel limit)
// - Per-attempt timeout: 5000ms so primary can complete structured JSON and secondary still gets >= 3500ms on timeout.
const PER_ATTEMPT_TIMEOUT_MS = 5000;
const MAX_TOTAL_GEMINI_TIME_MS = 8500;
const MIN_REMAINING_TIME_MS = 1800;
const TRANSIENT_RETRY_DELAY_MS = 350;

// Domain frontier pools for deep expansion without duplicates
const DOMAIN_EXTENSIONS: Record<string, Array<{ title: string; relationship: string; category: string; summary: string }>> = {
  astronomy: [
    { title: "Asteroid Belt", relationship: "Orbital reservoir between Mars and Jupiter supplying rocky impactors", category: "Planetary Science", summary: "The circumferential disc in the Solar System located between the orbits of Mars and Jupiter." },
    { title: "Kuiper Belt", relationship: "Circumstellar disc of icy bodies beyond Neptune source of short-period comets", category: "Planetary Science", summary: "The vast outer solar system ring of primordial icy remnants and dwarf planets." },
    { title: "Near-Earth Objects", relationship: "Asteroids and comets with perihelion distances bringing them near Earth's orbit", category: "Planetary Defense", summary: "Solar system bodies whose trajectories bring them into proximity with Earth's orbit." },
    { title: "Spectroscopy", relationship: "Analytical technique measuring emission spectra of vaporized meteors and stars", category: "Observational Astronomy", summary: "Analyzing light wavelengths to determine the elemental composition and temperature of celestial phenomena." },
    { title: "Barringer Crater", relationship: "Well-preserved Arizona impact crater formed by a nickel-iron meteorite", category: "Geophysics", summary: "A classic 1.2-kilometer meteorite crater formed approximately 50,000 years ago in Arizona." },
    { title: "Chicxulub Impact", relationship: "Cretaceous-Paleogene boundary impact event that caused the non-avian dinosaur extinction", category: "Earth History", summary: "The catastrophic 10-kilometer asteroid impact on the Yucatan peninsula 66 million years ago." },
  ],
  physics: [
    { title: "General Relativity", relationship: "Geometric theory of gravitation describing curved spacetime", category: "Theoretical Physics", summary: "Einstein's gravitational theory linking spacetime curvature to mass and energy." },
    { title: "Gravitational Lensing", relationship: "Deflection of light by extreme gravitational masses", category: "Observational Astrophysics", summary: "The bending of electromagnetic radiation around massive celestial structures." },
    { title: "Neutron Stars", relationship: "Ultra-dense stellar remnants formed by gravitational collapse of massive stars", category: "High Energy Astrophysics", summary: "Extremely compact stellar cores supported by neutron degeneracy pressure." },
    { title: "Pulsars", relationship: "Highly magnetized rotating neutron stars emitting beams of electromagnetic radiation", category: "Radio Astronomy", summary: "Rapidly spinning neutron stars with precise periodic radiation pulses." },
    { title: "Tidal Disruption Events", relationship: "Destruction of a star passing too close to a supermassive black hole", category: "Relativistic Astrophysics", summary: "Luminous transient flares caused when supermassive black holes shred approaching stars." },
    { title: "Quasars", relationship: "Extremely luminous active galactic nuclei powered by supermassive black holes", category: "Extragalactic Astronomy", summary: "The most energetic astronomical objects, radiating immense power across all wavelengths." },
  ],
  computing: [
    { title: "Algorithm Design", relationship: "Methodological blueprint for computationally solving formal problems", category: "Computer Science", summary: "Techniques for structuring efficient computational procedures and optimization." },
    { title: "Computational Complexity", relationship: "Classification of computational problems based on resource demands", category: "Theoretical Computer Science", summary: "The rigorous mathematical study of time and space bounds for algorithms." },
    { title: "Vector Embeddings", relationship: "High-dimensional geometric representations of semantic information", category: "Machine Learning", summary: "Mapping discrete concepts into continuous vector spaces to capture semantic similarity." },
    { title: "Graph Neural Networks", relationship: "Deep learning models processing relational and topological graph data", category: "Artificial Intelligence", summary: "Neural network architectures specialized for operating directly on graphs and networks." },
  ],
  biology: [
    { title: "Cellular Respiration", relationship: "Complementary metabolic pathway oxidizing sugars to generate ATP", category: "Metabolic Biochemistry", summary: "The biochemical process by which aerobic organisms extract energy from organic molecules." },
    { title: "Carbon Cycle", relationship: "Global biogeochemical cycle exchanging carbon across atmosphere, ocean, and biosphere", category: "Earth System Science", summary: "The movement of carbon between living biomass, geologic strata, and the atmosphere." },
    { title: "Stomata Regulation", relationship: "Microscopic leaf pores controlling carbon dioxide uptake and water transpiration", category: "Plant Physiology", summary: "Specialized epidermal valve cells balancing photosynthetic gas exchange and hydration." },
    { title: "Endosymbiotic Theory", relationship: "Evolutionary origin of chloroplasts and mitochondria from engulfed bacteria", category: "Evolutionary Biology", summary: "The landmark theory showing eukaryotic organelles evolved from symbiotic prokaryotes." },
  ],
};

// Boilerplate template patterns that signify low-quality filler AI responses
const PLACEHOLDER_PATTERNS = [
  /challenges classical assumptions about how spacetime/i,
  /sits at the crossroad of fundamental theory/i,
  /deep inquiry into .* consistently reveals nonlinear relationships/i,
  /theoretical perspectives on .* challenge conventional boundary/i,
  /could .* be an emergent manifestation of holographic spacetime/i,
  /unexpected implications across physical and philosophical boundaries/i,
  /profound intersections between physical reality, consciousness, and computational/i,
];

// Unwarranted buzzwords to flag when a topic is non-physics / non-cosmology
const UNWARRANTED_BUZZWORDS = [
  "quantum entanglement",
  "holographic spacetime",
  "quantum gravity",
  "bostrom's trilemma",
  "multiverse interpretation",
  "event horizon",
];

/**
 * Validates the quality and scientific relevance of the generated expansion.
 * Ensures facts are topic-specific, non-repetitive, and not boilerplate template text.
 */
export function validateQualityAndRelevance(
  data: TopicExpansionResult,
  topicTitle: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const normalizedTitle = topicTitle.toLowerCase().trim();

  // 1. Detect generic placeholder filler in summary or facts
  const allText = [data.summary, ...(data.facts || []), ...(data.exploreNext || [])].join(" ");
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(allText)) {
      issues.push(`Detected generic placeholder template matching ${pattern}`);
    }
  }

  // 2. Fact and curiosity question count / uniqueness check
  if (!data.facts || data.facts.length < 3) {
    issues.push(`Insufficient facts count: ${data.facts?.length || 0} (minimum 3 required)`);
  } else {
    const uniqueFacts = new Set(data.facts.map((f) => f.trim().toLowerCase()));
    if (uniqueFacts.size < data.facts.length) {
      issues.push("Duplicate or redundant facts detected");
    }
  }

  if (!data.exploreNext || data.exploreNext.length < 2) {
    issues.push(`Insufficient curiosity questions count: ${data.exploreNext?.length || 0} (minimum 2 required)`);
  }

  // 3. Related topics count and relevance check
  if (!data.relatedTopics || data.relatedTopics.length < 4) {
    issues.push(`Insufficient related topics: ${data.relatedTopics?.length || 0} (minimum 4 required)`);
  } else {
    // Check for duplicate related topic titles
    const uniqueRelTitles = new Set(data.relatedTopics.map((rt) => rt.title.trim().toLowerCase()));
    if (uniqueRelTitles.size < data.relatedTopics.length) {
      issues.push("Duplicate related topics detected");
    }

    // Flag unwarranted cosmic/quantum buzzwords if topic is clearly non-physics
    const isPhysicsTopic = [
      "quantum",
      "physics",
      "cosmolog",
      "black hole",
      "spacetime",
      "relativity",
      "gravity",
      "string theory",
      "thermodynamics",
    ].some((k) => normalizedTitle.includes(k) || data.category.toLowerCase().includes(k));

    if (!isPhysicsTopic) {
      for (const rt of data.relatedTopics) {
        const rtLower = rt.title.toLowerCase();
        if (UNWARRANTED_BUZZWORDS.some((b) => rtLower.includes(b))) {
          issues.push(`Unwarranted conceptual jump: "${rt.title}" attached to non-physics topic "${topicTitle}"`);
        }
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Builds a deterministic fallback result.
 * If curated data exists for the topic, returns genuine scientific facts & relationships.
 * If unfamiliar, returns an honest preview without fabricating scientific claims.
 */
export function buildCuratedFallback(
  topicTitle: string,
  existingConnectionTitles: string[] = []
): TopicExpansionResult {
  const curated = getCuratedTopic(topicTitle);
  const existingSet = new Set(existingConnectionTitles.map((t) => t.toLowerCase()));

  if (curated) {
    // Filter out connections already created for this node to prevent duplicates
    const pool = curated.relatedTopics.filter(
      (rt) => !existingSet.has(rt.title.toLowerCase())
    );

    // If existing connections already saturated the primary list, draw from domain extension pool
    if (pool.length < 4) {
      const catLower = curated.category.toLowerCase();
      let domainKey = "astronomy";
      if (catLower.includes("physics") || catLower.includes("spacetime") || catLower.includes("black hole")) {
        domainKey = "physics";
      } else if (catLower.includes("comput") || catLower.includes("intelligence") || catLower.includes("neural")) {
        domainKey = "computing";
      } else if (catLower.includes("bio") || catLower.includes("plant") || catLower.includes("life")) {
        domainKey = "biology";
      }

      const extensions = DOMAIN_EXTENSIONS[domainKey] || DOMAIN_EXTENSIONS.astronomy;
      for (const ext of extensions) {
        if (pool.length >= 6) break;
        if (!existingSet.has(ext.title.toLowerCase()) && !pool.some((p) => p.title.toLowerCase() === ext.title.toLowerCase())) {
          pool.push(ext);
        }
      }
    }

    const relatedTopics = (pool.length > 0 ? pool : curated.relatedTopics).slice(0, 8);

    return {
      title: curated.title,
      category: curated.category,
      description: curated.description,
      summary: curated.summary,
      facts: curated.facts,
      exploreNext: curated.exploreNext,
      relatedTopics,
      isFallback: true,
      fallbackReason: "curated_archive",
    };
  }

  // Honest, non-fabricated fallback for unfamiliar topics (never invent relationships or facts)
  const titleCap = topicTitle.trim().charAt(0).toUpperCase() + topicTitle.trim().slice(1);
  return {
    title: titleCap,
    category: "Unverified Topic",
    description: `Live AI synthesis for "${titleCap}" is currently unavailable.`,
    summary: `Dynamic AI synthesis for "${titleCap}" is temporarily unavailable due to Gemini API demand or quota constraints, and no verified curated entry exists for this topic yet. Please retry AI synthesis shortly.`,
    facts: [],
    exploreNext: [],
    relatedTopics: [],
    isFallback: true,
    fallbackReason: "service_unavailable_honest_fallback",
  };
}

/**
 * Expands a topic using Google Gemini API with fallback resilience.
 * Employs strict per-attempt timeouts, model failover, quality validation, and timing telemetry.
 */
export async function expandTopicWithGemini(
  topicTitle: string,
  existingConnectionTitles: string[] = []
): Promise<GeminiExpansionOutput> {
  const globalStart = performance.now();
  const apiKey = process.env.GEMINI_API_KEY;
  let attemptsCount = 0;
  let lastUsedModel = "none";

  if (apiKey && !apiKey.startsWith("your_") && apiKey.length > 10) {
    const existingListStr =
      existingConnectionTitles.length > 0
        ? existingConnectionTitles.join(", ")
        : "none";

    const prompt = `You are a world-class scientific knowledge synthesis engine for "The Rabbit Hole", an interactive curiosity and discovery platform.
Expand the topic: "${topicTitle}".

CRITICAL SCIENTIFIC & TOPIC-GROUNDING REQUIREMENTS:
1. TOPIC INTEGRITY: Stay strictly grounded in "${topicTitle}". NEVER inject unrelated buzzwords like "quantum mechanics", "quantum gravity", "holographic spacetime", "simulation hypothesis", "consciousness", or "multiverse" UNLESS the topic itself is fundamentally about those subjects.
2. ACCURACY: Provide true, scientifically and historically grounded explanations. For astronomy/planetary topics (such as meteors), distinguish between meteoroids (in space), meteors (in the atmosphere), and meteorites (on the ground).
3. FACTS (4 to 6 items): Each fact must be concrete, verifiable, and fascinating. Include specific real-world mechanisms (e.g. ram pressure and atmospheric ablation, plasma trails), historical events/discoveries (e.g. Chelyabinsk superbolide, Tunguska event), parent comets & annual showers (e.g. Perseids from Comet Swift-Tuttle), or planetary impact geology.
4. RELATED TOPICS (5 to 8 items): Must be genuinely and meaningfully connected to "${topicTitle}".
   - "relationship": An explanatory phrase describing the exact physical or conceptual connection to "${topicTitle}".
5. CURIOSITY QUESTIONS (3 to 5 items): Logical, thought-provoking questions that naturally arise from understanding "${topicTitle}".

Do NOT include any of these already connected topics: ${existingListStr}.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "${topicTitle}",
  "category": "Appropriate Domain (e.g. Astronomy & Planetary Science, Physics, Evolutionary Biology, Computer Science, History)",
  "description": "A clear, precise 1-2 sentence definition of what ${topicTitle} actually is.",
  "summary": "A substantive, compelling 2-3 sentence explanation of why ${topicTitle} matters scientifically, historically, or technologically.",
  "facts": [
    "Fact 1",
    "Fact 2",
    "Fact 3",
    "Fact 4"
  ],
  "exploreNext": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ],
  "relatedTopics": [
    {
      "title": "Concept Name",
      "relationship": "How they specifically connect",
      "category": "Domain",
      "summary": "1-sentence summary of this connected concept"
    }
  ]
}`;

    for (const model of CANDIDATE_MODELS) {
      for (let modelRetry = 0; modelRetry < 2; modelRetry++) {
        const elapsedSoFar = performance.now() - globalStart;
        const remainingTime = MAX_TOTAL_GEMINI_TIME_MS - elapsedSoFar;

        if (remainingTime < MIN_REMAINING_TIME_MS) {
          console.warn(`[Gemini] Remaining time budget (${Math.round(remainingTime)}ms) insufficient for model ${model}; aborting to fallback.`);
          break;
        }

        attemptsCount++;
        lastUsedModel = model;
        const attemptTimeout = Math.min(PER_ATTEMPT_TIMEOUT_MS, remainingTime);
        const attemptStart = performance.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), attemptTimeout);

        try {
          console.log(`[Gemini] Starting attempt ${attemptsCount} for "${topicTitle}" (model: ${model}, timeout: ${Math.round(attemptTimeout)}ms)`);

          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.25,
              abortSignal: controller.signal,
            },
          });

          clearTimeout(timer);
          const attemptMs = Math.round(performance.now() - attemptStart);
          const responseText = response.text;

          if (responseText) {
            const zodStart = performance.now();
            let parsedJson: unknown;
            try {
              parsedJson = JSON.parse(responseText);
            } catch {
              console.warn(`[Gemini] Model ${model} returned unparseable JSON text`);
              break;
            }

            const validated = TopicExpansionSchema.safeParse(parsedJson);
            const zodMs = Math.round(performance.now() - zodStart);

            if (validated.success) {
              // Quality and relevance validation
              const qualityCheck = validateQualityAndRelevance(validated.data, topicTitle);

              if (qualityCheck.isValid) {
                const totalMs = Math.round(performance.now() - globalStart);
                console.log(`[Gemini] SUCCESS for "${topicTitle}" in ${totalMs}ms (model: ${model}, API: ${attemptMs}ms, Zod: ${zodMs}ms)`);
                return {
                  ...validated.data,
                  isFallback: false,
                  timing: {
                    durationMs: totalMs,
                    attempts: attemptsCount,
                    modelUsed: model,
                    usedFallback: false,
                  },
                };
              } else {
                console.warn(`[Gemini] Response failed quality/relevance check for model ${model}:`, qualityCheck.issues);
                break;
              }
            } else {
              console.warn(`[Gemini] Response failed Zod schema for model ${model}:`, validated.error.issues);
              break;
            }
          }
          break;
        } catch (err: unknown) {
          clearTimeout(timer);
          const attemptMs = Math.round(performance.now() - attemptStart);
          const isAbort = err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
          const msg = err instanceof Error ? err.message : String(err);
          const status = (err as { status?: number }).status;

          console.warn(`[Gemini] Attempt ${attemptsCount} with model ${model} failed in ${attemptMs}ms: ${isAbort ? "TIMED OUT" : `status ${status || msg}`}`);

          // Only retry once on transient 503 if sufficient budget remains for secondary failover
          const remainingAfterErr = MAX_TOTAL_GEMINI_TIME_MS - (performance.now() - globalStart);
          if (status === 503 && modelRetry === 0 && remainingAfterErr >= 3800) {
            await new Promise((r) => setTimeout(r, TRANSIENT_RETRY_DELAY_MS));
            continue;
          }

          // Do not retry 401/403/404/429 or timeouts on the same model; fail over to next model
          break;
        }
      }
    }
  }

  // Trigger rich curated or honest deterministic fallback
  const fallbackStart = performance.now();
  const fallback = buildCuratedFallback(topicTitle, existingConnectionTitles);
  const fallbackMs = Math.round(performance.now() - fallbackStart);
  const totalMs = Math.round(performance.now() - globalStart);

  console.log(`[Gemini Fallback] Returned curated/honest fallback for "${topicTitle}" in ${totalMs}ms (fallback gen: ${fallbackMs}ms)`);
  return {
    ...fallback,
    timing: {
      durationMs: totalMs,
      attempts: attemptsCount,
      modelUsed: lastUsedModel,
      usedFallback: true,
    },
  };
}
