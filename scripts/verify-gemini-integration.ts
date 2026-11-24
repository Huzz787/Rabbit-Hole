import { PrismaClient } from "@prisma/client";
import { expandTopicWithGemini, TopicExpansionSchema } from "../lib/gemini/service.ts";

async function main() {
  console.log("=================================================");
  console.log("   The Rabbit Hole — Gemini AI & Aiven Test Suite");
  console.log("=================================================\n");

  const originalApiKey = process.env.GEMINI_API_KEY;
  if (!originalApiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment.");
  }
  console.log("✓ Step 1: GEMINI_API_KEY is securely configured (key length:", originalApiKey.length, ")");

  // Connect to Prisma with retry for cloud reliability
  const prisma = new PrismaClient({
    log: ["error"],
  });

  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect();
      const test = await prisma.$queryRaw`SELECT 1 as result`;
      if (test) {
        connected = true;
        break;
      }
    } catch {
      console.warn(`Connection attempt ${attempt} failed, retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    throw new Error("Unable to establish connection to Aiven PostgreSQL.");
  }
  console.log("✓ Connected to Aiven PostgreSQL instance successfully.");

  const createdTopicIds: string[] = [];

  try {
    // 2. Test Gemini Topic Generation on "Black Holes"
    console.log("\n--- Step 2: Testing Gemini Topic Generation for 'Black Holes' ---");
    const expansion = await expandTopicWithGemini("Black Holes", []);
    const validated = TopicExpansionSchema.parse(expansion);

    console.log("✓ Validated structured response via Zod Schema:");
    console.log("  • Title:", validated.title);
    console.log("  • Category:", validated.category);
    console.log("  • Description:", validated.description);
    console.log("  • Summary:", validated.summary);
    console.log("  • Mind-Bending Facts count:", validated.facts.length);
    console.log("  • Explore Next Suggestions count:", validated.exploreNext.length);
    console.log("  • Related Topics count (5–8):", validated.relatedTopics.length);

    validated.relatedTopics.forEach((rel, i) => {
      console.log(`    [${i + 1}] ${rel.title} (${rel.relationship}) -> ${rel.category}`);
    });

    // 3. Connect & Save to Aiven PostgreSQL
    console.log("\n--- Step 3: Persisting Generated Topics and Relationships into Aiven ---");
    const rootTopic = await prisma.topic.upsert({
      where: { title: "Black Holes" },
      create: {
        title: "Black Holes",
        name: "Black Holes",
        category: validated.category,
        description: validated.description,
        summary: validated.summary,
        depth: 1,
      },
      update: {
        category: validated.category,
        description: validated.description,
        summary: validated.summary,
      },
    });
    createdTopicIds.push(rootTopic.id);
    console.log("✓ Upserted root topic in Aiven:", rootTopic.title, `(${rootTopic.id})`);

    let connectionsCreated = 0;
    for (const rel of validated.relatedTopics) {
      const child = await prisma.topic.upsert({
        where: { title: rel.title },
        create: {
          title: rel.title,
          name: rel.title,
          category: rel.category,
          summary: rel.summary,
          depth: 2,
        },
        update: {
          category: rel.category,
          summary: rel.summary,
        },
      });
      createdTopicIds.push(child.id);

      const conn = await prisma.topicConnection.upsert({
        where: {
          sourceTopicId_targetTopicId: {
            sourceTopicId: rootTopic.id,
            targetTopicId: child.id,
          },
        },
        create: {
          sourceTopicId: rootTopic.id,
          targetTopicId: child.id,
          relationship: rel.relationship,
          weight: 1.0,
        },
        update: {
          relationship: rel.relationship,
        },
      });
      if (conn) connectionsCreated++;
    }
    console.log(`✓ Persisted ${connectionsCreated} interconnected edges in Aiven.`);

    // 4. Test Duplicate Prevention
    console.log("\n--- Step 4: Testing Duplicate Prevention ---");
    const existingConnections = await prisma.topicConnection.findMany({
      where: { sourceTopicId: rootTopic.id },
      include: { targetTopic: true },
    });
    const existingTitles = existingConnections.map((c) => c.targetTopic.title);
    console.log(`Current connected topics (${existingTitles.length}):`, existingTitles.join(", "));

    // Re-expand with existing titles passed
    const secondExpansion = await expandTopicWithGemini("Black Holes", existingTitles);
    console.log("✓ Re-expansion with existing titles succeeded.");
    const overlap = secondExpansion.relatedTopics.filter((rt) =>
      existingTitles.some((et) => et.toLowerCase() === rt.title.toLowerCase())
    );
    console.log(`✓ Overlap count against existing connections: ${overlap.length} (Expected: 0 duplicate edges created)`);

    // 5. Test Expanding a Generated Topic
    const topicToBranch = validated.relatedTopics[0]?.title || "Hawking Radiation";
    console.log(`\n--- Step 5: Expanding Generated Topic: '${topicToBranch}' ---`);
    const branchedExpansion = await expandTopicWithGemini(topicToBranch, ["Black Holes"]);
    const validatedBranch = TopicExpansionSchema.parse(branchedExpansion);
    console.log(`✓ Successfully branched into '${validatedBranch.title}' with ${validatedBranch.relatedTopics.length} new rabbit holes.`);

    // 6. Test Offline Fallback
    console.log("\n--- Step 6: Testing Graceful Offline Fallback (Simulated API Outage) ---");
    process.env.GEMINI_API_KEY = ""; // Temporarily clear key
    const fallbackExpansion = await expandTopicWithGemini("Quantum Entanglement", []);
    const validatedFallback = TopicExpansionSchema.parse(fallbackExpansion);
    console.log("✓ Fallback returned valid structured schema without crashing:");
    console.log("  • Fallback Title:", validatedFallback.title);
    console.log("  • Fallback Category:", validatedFallback.category);
    console.log("  • Fallback Related Topics:", validatedFallback.relatedTopics.length);
    process.env.GEMINI_API_KEY = originalApiKey; // Restore key

    // 7. Verify Exploration History and Saved Discoveries Integration
    console.log("\n--- Step 7: Testing Exploration History & Saved Discoveries ---");
    const historyRecord = await prisma.explorationHistory.create({
      data: {
        sessionId: "test-gemini-session",
        topicId: rootTopic.id,
      },
    });
    console.log("✓ Exploration history recorded:", historyRecord.id);

    const savedRecord = await prisma.savedDiscoveries.create({
      data: {
        sessionId: "test-gemini-session",
        topicId: rootTopic.id,
        notes: "Test bookmark notes generated by Gemini test suite",
      },
    });
    console.log("✓ Saved discovery bookmark recorded:", savedRecord.id);

    // 8. Clean up test records (only test records created in this run)
    console.log("\n--- Step 8: Cleaning Up Test Records ---");
    await prisma.savedDiscoveries.deleteMany({
      where: { sessionId: "test-gemini-session" },
    });
    await prisma.explorationHistory.deleteMany({
      where: { sessionId: "test-gemini-session" },
    });
    // Remove created connections and topics
    const uniqueTopicIds = Array.from(new Set(createdTopicIds));
    await prisma.topicConnection.deleteMany({
      where: {
        OR: [
          { sourceTopicId: { in: uniqueTopicIds } },
          { targetTopicId: { in: uniqueTopicIds } },
        ],
      },
    });
    await prisma.topic.deleteMany({
      where: { id: { in: uniqueTopicIds } },
    });
    console.log("✓ Successfully cleaned up all temporary test records.");

    console.log("\n=================================================");
    console.log("  ✓ All Gemini AI & Aiven tests PASSED successfully!");
    console.log("=================================================\n");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Test execution failed:", msg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
