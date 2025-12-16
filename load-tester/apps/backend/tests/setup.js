const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.SESSION_SECRET = "test-secret";

// Suppress Prisma internal debug logging during tests
// Prisma 7's @prisma/internals/logger uses console.log with "prisma:error" prefix
// These logs may start with a newline character, so we need to handle both patterns
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Filter out Prisma internal debug logs
  // The message may be "prisma:error ..." or "\nprisma:error ..."
  if (args[0] && typeof args[0] === "string") {
    const trimmed = args[0].trim();
    if (trimmed.startsWith("prisma:error")) {
      return; // Suppress Prisma internal error logs
    }
  }
  originalConsoleLog.apply(console, args);
};

// Setup test database before all tests
beforeAll(async () => {
  const testDbPath = path.join(__dirname, "../prisma/test.db");

  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Run migrations for test database
  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
      cwd: path.join(__dirname, ".."),
      stdio: "ignore",
    });

    // Generate Prisma Client
    execSync("npx prisma generate", {
      cwd: path.join(__dirname, ".."),
      stdio: "ignore",
    });
  } catch (error) {
    console.error("Failed to setup test database:", error);
  }
}, 30000);

afterAll(async () => {
  // Cleanup test database after all tests
  const testDbPath = path.join(__dirname, "../prisma/test.db");
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});
