/**
 * Centralized Error Handling Middleware
 * Maps errors to appropriate HTTP responses with consistent formatting
 */

const {
  AppError,
  ValidationError,
  NotFoundError,
  InternalError,
} = require("../utils/errors");
const {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} = require("@prisma/client");

/**
 * Map Prisma error codes to our custom error classes
 * @param {Error} error - Prisma error
 * @returns {AppError} - Mapped custom error
 */
function mapPrismaError(error) {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        // Unique constraint violation
        const field = error.meta?.target?.[0] || "field";
        return new ValidationError(
          `A record with this ${field} already exists`
        );
      }
      case "P2025":
        // Record not found
        return new NotFoundError("Record");
      case "P2003":
        // Foreign key constraint failed
        return new ValidationError(
          "Invalid reference - related record not found"
        );
      case "P2014":
        // Invalid ID
        return new ValidationError("Invalid ID format");
      default:
        // Generic Prisma error
        return new InternalError("Database operation failed");
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new ValidationError("Invalid data provided");
  }

  return null;
}

/**
 * Format error response based on environment
 * @param {Error} error - Error object
 * @param {string} env - Environment (development/production)
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(error, env) {
  const isDevelopment = env === "development";

  // Base response
  const response = {
    error: true,
    message: error.message || "An error occurred",
    type: error.name || "Error",
  };

  // Add validation details if present
  if (error instanceof ValidationError && error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  // Add additional debug info in development
  if (isDevelopment && error.meta) {
    response.meta = error.meta;
  }

  return response;
}

/**
 * Log error with appropriate level and context
 * @param {Error} error - Error to log
 * @param {Object} req - Express request object
 */
function logError(error, req) {
  const context = {
    requestId: req.id, // Request ID for tracing
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  };

  // Determine log level based on error type
  if (error.isOperational === false || error.statusCode >= 500) {
    // Server errors - log with full context
    console.error("❌ Server Error:", {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
      stack: error.stack,
      ...context,
    });
  } else if (error.statusCode >= 400) {
    // Client errors - log as warning
    console.warn("⚠️  Client Error:", {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
      ...context,
    });
  }
}

/**
 * Main error handling middleware
 * Must be registered after all routes
 */
function errorHandler(err, req, res, next) {
  let error = err;

  // Map Prisma errors to our custom errors
  const prismaError = mapPrismaError(err);
  if (prismaError) {
    error = prismaError;
  }

  // Convert unknown errors to AppError
  if (!(error instanceof AppError)) {
    error = new InternalError(
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred"
    );
    error.stack = err.stack; // Preserve original stack
  }

  // Log the error
  logError(error, req);

  // Send response
  const statusCode = error.statusCode || 500;
  const response = formatErrorResponse(error, process.env.NODE_ENV);

  // Include request ID in error response for tracing
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler for undefined routes
 * Should be registered after all valid routes but before error handler
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError("Route");
  error.message = `Route ${req.method} ${req.path} not found`;
  next(error);
}

module.exports = {
  errorHandler,
  notFoundHandler,
  mapPrismaError,
  formatErrorResponse,
};
