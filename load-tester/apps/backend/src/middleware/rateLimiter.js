/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 */

const rateLimit = require("express-rate-limit");
const config = require("../config");

/**
 * General API rate limiter
 * Applies to all API routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDevelopment ? 1000 : 100, // Limit each IP to 100 requests per windowMs (1000 in dev)
  message: {
    error: true,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: () => config.isTest,
});

/**
 * Strict rate limiter for load test execution
 * More restrictive to prevent resource exhaustion
 */
const loadTestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: config.isDevelopment ? 100 : 10, // Limit to 10 load tests per 5 minutes (100 in dev)
  message: {
    error: true,
    message:
      "Too many load tests initiated from this IP. Please wait before starting another test.",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
});

/**
 * Auth-related rate limiter (for future authentication endpoints)
 * Very strict to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDevelopment ? 100 : 5, // Limit to 5 attempts per 15 minutes
  message: {
    error: true,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
});

module.exports = {
  apiLimiter,
  loadTestLimiter,
  authLimiter,
};
