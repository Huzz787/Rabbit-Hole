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

// Reuse connection across warm serverless lambdas to prevent Aiven connection pool exhaustion
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

globalForPrisma.prisma = prisma;

/**
 * Database query timeout wrapper.
 *
 * NOTE ON QUERY CANCELLATION LIMITATION:
 * JavaScript Promise.race allows the API route to unblock and return an HTTP response
 * within the serverless deadline, but it does NOT cancel the in-flight query on the
 * remote PostgreSQL connection wire. The database engine will continue processing
 * until statement_timeout or completion.
 *
 * An error handler (.catch) is attached to the query promise to safely swallow any
 * late post-timeout rejections and avoid unhandled rejection warnings in serverless runtimes.
 */
export async function withQueryTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs = 4000,
  fallbackValue: T
): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, timeoutMs);
  });

  const queryPromise = queryFn();
  // Prevent unhandled rejections if the underlying database call fails after the timeout resolves
  queryPromise.catch(() => {});

  try {
    return await Promise.race([queryPromise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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
    await withQueryTimeout(() => prisma.$queryRaw`SELECT 1`, 3000, null);
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
