/**
 * Custom Error Classes
 * Semantic error types for consistent error handling
 */

/**
 * Base application error class
 * All custom errors should extend this
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

/**
 * 409 Conflict - Resource already exists or conflict with current state
 */
class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Authenticated but not authorized
 */
class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

/**
 * 408 Request Timeout - Operation took too long
 */
class TimeoutError extends AppError {
  constructor(message = "Operation timed out") {
    super(message, 408);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, false); // Not operational - unexpected error
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  TimeoutError,
  InternalError,
};
