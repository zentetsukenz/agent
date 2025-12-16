/**
 * Database Configuration
 * Singleton PrismaClient instance to share across the application
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

/**
 * Singleton Prisma Client instance
 * Prevents multiple instances and connection pool exhaustion
 */
let prisma;

/**
 * Get or create Prisma Client instance
 * @returns {PrismaClient} - Shared Prisma instance
 */
function getPrismaClient() {
  if (!prisma) {
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

    // Create Prisma adapter with URL config
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });

    // Initialize Prisma Client with adapter (required in Prisma 7)
    prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Graceful shutdown handling
    process.on("beforeExit", async () => {
      await prisma.$disconnect();
    });
  }

  return prisma;
}

/**
 * Disconnect Prisma Client
 * Useful for testing and cleanup
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = {
  getPrismaClient,
  disconnectPrisma,
};
