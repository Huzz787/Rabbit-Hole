import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/database/prisma";

export async function GET() {
  const dbStatus = await testDatabaseConnection();

  return NextResponse.json({
    status: "ok",
    app: "The Rabbit Hole",
    database: {
      provider: "Aiven PostgreSQL",
      connected: dbStatus.connected,
      status: dbStatus.message,
    },
    timestamp: new Date().toISOString(),
  });
}
