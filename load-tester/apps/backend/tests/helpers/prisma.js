/**
 * Test Helper for Prisma Client
 * Creates a properly configured Prisma Client with better-sqlite3 adapter for testing
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

/**
 * Create a test Prisma Client with adapter
 * @param {string} dbUrl - Optional database URL
 * @returns {PrismaClient} - Configured Prisma Client for testing
 */
function createTestPrismaClient(dbUrl = "file:./prisma/test.db") {
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });

  return new PrismaClient({
    adapter,
    log: process.env.DEBUG_TESTS ? ["query", "error", "warn"] : [],
  });
}

module.exports = { createTestPrismaClient };
