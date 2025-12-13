/**
 * Database Configuration
 * Singleton PrismaClient instance to share across the application
 */

const { PrismaClient } = require("@prisma/client");

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
    prisma = new PrismaClient({
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
