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
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:5173", "http://localhost:5174"],
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

  // SSRF Protection
  ssrf: {
    // Block private IPs in production, allow in dev/test for local testing
    blockPrivateIPs:
      process.env.BLOCK_PRIVATE_IPS === "false"
        ? false
        : process.env.NODE_ENV === "production",

    // Always block these hosts (cloud metadata endpoints, localhost variants)
    blockedHosts: [
      // AWS/Azure metadata service
      "169.254.169.254",
      // GCP metadata service
      "metadata.google.internal",
      "metadata.internal",
      // Localhost variants
      "localhost",
      "127.0.0.1",
      "::1",
      "0.0.0.0",
      "::",
    ],

    // Allow specific hosts even if they're private IPs
    // Format: Comma-separated in env: "internal-api.example.com,staging.example.com"
    allowlist: process.env.SSRF_ALLOWLIST
      ? process.env.SSRF_ALLOWLIST.split(",").map((h) => h.trim())
      : [],
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || null, // null = use default for environment

  // Computed flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

module.exports = config;
