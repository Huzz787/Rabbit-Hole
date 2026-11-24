import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Safe connection string sanitizer (masks password and sensitive tokens in error messages)
export function sanitizeConnectionError(error: unknown): string {
  if (!error) return "Unknown database error";
  const str = error instanceof Error ? error.message : String(error);
  // Redact postgresql://user:password@host...
  return str.replace(/postgresql:\/\/[^:]+:([^@]+)@/gi, "postgresql://****:****@");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Safe database connection test helper
 * Returns connection status without printing or leaking credentials.
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      message: "DATABASE_URL is not set in environment variables.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: "Successfully connected to Aiven PostgreSQL.",
    };
  } catch (err) {
    return {
      connected: false,
      message: sanitizeConnectionError(err),
    };
  }
}

export default prisma;
