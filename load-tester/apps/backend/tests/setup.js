const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.SESSION_SECRET = "test-secret";

// Suppress Prisma internal debug logging during tests
// Prisma 7's @prisma/internals/logger uses console.log directly with "prisma:error" prefix
// This bypasses our logger utility, so we need to intercept console.log specifically for this
// Note: Our logger utility handles all other application logs via LOG_LEVEL=silent in test
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Filter function for Prisma internal logs
// Check if any argument contains Prisma internal log markers
const isPrismaInternalLog = (args) => {
  for (const arg of args) {
    if (arg && typeof arg === "string") {
      // Check if the string contains prisma: anywhere (not just at start)
      // This handles cases like "\nprisma:error" or "prisma:query"
      if (
        arg.includes("prisma:error") ||
        arg.includes("prisma:query") ||
        arg.includes("prisma:warn")
      ) {
        return true;
      }
    }
  }
  return false;
};

console.log = (...args) => {
  if (isPrismaInternalLog(args)) {
    return; // Suppress Prisma internal logs
  }
  originalConsoleLog.apply(console, args);
};

console.warn = (...args) => {
  if (isPrismaInternalLog(args)) {
    return; // Suppress Prisma internal logs
  }
  originalConsoleWarn.apply(console, args);
};

console.error = (...args) => {
  if (isPrismaInternalLog(args)) {
    return; // Suppress Prisma internal logs
  }
  originalConsoleError.apply(console, args);
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
