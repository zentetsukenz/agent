/**
 * Jest Test Setup
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

// Setup test database once before all tests
beforeAll(async () => {
  try {
    const dbPath = path.join(__dirname, "..", "test.db");
    const journalPath = path.join(__dirname, "..", "test.db-journal");

    // Remove existing test database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
    }

    // Push schema to test database
    execSync("npx prisma db push --skip-generate --force-reset", {
      env: { ...process.env, DATABASE_URL: "file:./test.db" },
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
    });
  } catch (error) {
    console.error("Failed to setup test database:", error.message);
    throw error;
  }
}, 30000);
