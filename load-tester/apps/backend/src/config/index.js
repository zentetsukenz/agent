/**
 * Application Configuration
 * Centralized, validated configuration management
 */

require("dotenv").config();

/**
 * Validate that required environment variables are set
 * Fails fast on startup if critical config is missing
 */
function validateConfig() {
  const required = ["DATABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Validate on module load
validateConfig();

/**
 * Application configuration object
 * Type-safe access to environment variables with defaults
 */
const config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  env: process.env.NODE_ENV || "development",

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },

  // Session (if needed in future)
  session: {
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  },

  // Load Testing Limits
  loadTest: {
    maxDuration: 300, // seconds
    maxConnections: 1000,
    maxRPS: 100000,
    maxTimeout: 600, // seconds
  },

  // Computed flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

module.exports = config;
