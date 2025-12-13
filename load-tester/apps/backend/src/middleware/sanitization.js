/**
 * Input Sanitization Middleware
 * Protects against XSS and injection attacks
 */

const validator = require("validator");

/**
 * Recursively sanitize strings in an object
 * @param {*} value - Value to sanitize
 * @returns {*} - Sanitized value
 */
function sanitizeValue(value) {
  if (typeof value === "string") {
    // Escape HTML entities to prevent XSS
    return validator.escape(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === "object") {
    const sanitized = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Middleware to sanitize request body, query, and params
 * Applies HTML escaping to prevent XSS attacks
 */
function sanitizeInput(req, res, next) {
  // Sanitize body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params);
  }

  next();
}

/**
 * Unescape specific fields that should contain JSON or URLs
 * Use this middleware AFTER validation but BEFORE processing
 */
function unescapeJsonFields(...fields) {
  return (req, res, next) => {
    if (!req.body) {
      return next();
    }

    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = validator.unescape(req.body[field]);
      }
    }

    next();
  };
}

module.exports = {
  sanitizeInput,
  sanitizeValue,
  unescapeJsonFields,
};
