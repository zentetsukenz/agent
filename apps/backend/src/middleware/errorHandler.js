/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: true,
    message: "Route not found",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
