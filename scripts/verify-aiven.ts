import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Aiven PostgreSQL Connection ===");

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  // 1. Connectivity test
  const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
  console.log("✓ Successfully connected to Aiven PostgreSQL. Server time:", result[0]?.now);

  // 2. Test Topic insertion
  const testTitle = `Test Topic ${Date.now()}`;
  const topicA = await prisma.topic.create({
    data: {
      title: testTitle,
      category: "Test Category",
      summary: "Verification test node for Aiven PostgreSQL",
      depth: 1,
    },
  });
  console.log("✓ Created test Topic:", topicA.id, topicA.title);

  const topicB = await prisma.topic.create({
    data: {
      title: `${testTitle} - Related`,
      category: "Test Category",
      summary: "Connected test node",
      depth: 2,
    },
  });
  console.log("✓ Created connected test Topic:", topicB.id, topicB.title);

  // 3. Test TopicConnection insertion
  const connection = await prisma.topicConnection.create({
    data: {
      sourceTopicId: topicA.id,
      targetTopicId: topicB.id,
      relationship: "Verification Link",
      weight: 1.0,
    },
  });
  console.log("✓ Created TopicConnection:", connection.id);

  // 4. Test ExplorationHistory insertion
  const history = await prisma.explorationHistory.create({
    data: {
      sessionId: "test-session",
      topicId: topicA.id,
    },
  });
  console.log("✓ Recorded ExplorationHistory:", history.id);

  // 5. Test SavedDiscoveries insertion
  const saved = await prisma.savedDiscoveries.create({
    data: {
      sessionId: "test-session",
      topicId: topicA.id,
      notes: "Test bookmark notes",
    },
  });
  console.log("✓ Recorded SavedDiscoveries:", saved.id);

  // 6. Cleanup test records so we leave zero clutter in Aiven
  await prisma.savedDiscoveries.delete({ where: { id: saved.id } });
  await prisma.explorationHistory.delete({ where: { id: history.id } });
  await prisma.topicConnection.delete({ where: { id: connection.id } });
  await prisma.topic.delete({ where: { id: topicB.id } });
  await prisma.topic.delete({ where: { id: topicA.id } });
  console.log("✓ Cleaned up all verification test records successfully.");

  console.log("=== All Aiven PostgreSQL tests passed! ===");
}

main()
  .catch((e) => {
    // Sanitize any error so password is never printed in logs
    const msg = e instanceof Error ? e.message : String(e);
    const sanitized = msg.replace(/postgresql:\/\/[^:]+:([^@]+)@/gi, "postgresql://****:****@");
    console.error("Database test error:", sanitized);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
