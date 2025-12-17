const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.SESSION_SECRET = "test-secret";

// Suppress Prisma internal debug logging during tests
// Prisma 7's @prisma/internals/logger uses console.log directly with "prisma:" prefix
// This cannot be controlled via our logger - must intercept at console level
const originalConsoleLog = console.log;

console.log = (...args) => {
  // Filter Prisma internal logs (they use console.log with prisma: prefix)
  for (const arg of args) {
    if (arg && typeof arg === "string" && arg.includes("prisma:")) {
      return;
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
