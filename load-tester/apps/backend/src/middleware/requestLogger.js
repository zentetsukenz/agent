/**
 * Request Logging Middleware
 * Logs HTTP requests with request IDs for traceability
 */

const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");

/**
 * Add unique request ID to each request
 * Enables request tracing across logs
 */
function requestId(req, res, next) {
  req.id = uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
}

/**
 * Custom Morgan token for request ID
 */
morgan.token("id", (req) => req.id);

/**
 * Custom Morgan token for response time in ms with color
 */
morgan.token("response-time-colored", (req, res) => {
  if (!req._startAt || !res._startAt) {
    return "";
  }

  const ms =
    (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;

  // Color code based on response time
  if (ms < 100) return `\x1b[32m${ms.toFixed(2)}ms\x1b[0m`; // Green
  if (ms < 500) return `\x1b[33m${ms.toFixed(2)}ms\x1b[0m`; // Yellow
  return `\x1b[31m${ms.toFixed(2)}ms\x1b[0m`; // Red
});

/**
 * Custom Morgan token for status code with color
 */
morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  let color = "\x1b[0m"; // Default

  if (status >= 500) color = "\x1b[31m"; // Red
  else if (status >= 400) color = "\x1b[33m"; // Yellow
  else if (status >= 300) color = "\x1b[36m"; // Cyan
  else if (status >= 200) color = "\x1b[32m"; // Green

  return `${color}${status}\x1b[0m`;
});

/**
 * Development format - detailed and colored
 */
const developmentFormat =
  "🔷 :id | :method :url | :status-colored | :response-time-colored | :remote-addr";

/**
 * Production format - JSON structured logs
 */
const productionFormat = JSON.stringify({
  timestamp: ":date[iso]",
  requestId: ":id",
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time",
  contentLength: ":res[content-length]",
  ip: ":remote-addr",
  userAgent: ":user-agent",
});

/**
 * Create logger based on environment
 */
function createLogger() {
  const format = config.isDevelopment ? developmentFormat : productionFormat;

  return morgan(format, {
    // Skip logging for health checks in production
    skip: (req) => config.isProduction && req.url === "/api/health",
  });
}

/**
 * Error logger - logs requests that result in errors
 */
const errorLogger = morgan(
  config.isDevelopment
    ? "❌ :id | :method :url | :status-colored | :response-time-colored"
    : productionFormat,
  {
    skip: (req, res) => res.statusCode < 400,
  }
);

module.exports = {
  requestId,
  requestLogger: createLogger(),
  errorLogger,
};
