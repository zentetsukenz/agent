/**
 * Variable Interpolation Utility
 * Replaces {{variableName}} placeholders with values from context
 */

/**
 * Interpolate variables in a string
 * Replaces all {{variableName}} occurrences with values from context
 *
 * @param {string} template - String containing {{variable}} placeholders
 * @param {Object} context - Key-value pairs for variable substitution
 * @returns {string} - Interpolated string
 *
 * @example
 * interpolate("Hello {{name}}", { name: "World" })
 * // Returns: "Hello World"
 *
 * interpolate("/api/books/{{bookUid}}", { bookUid: "abc123" })
 * // Returns: "/api/books/abc123"
 */
function interpolate(template, context = {}) {
  if (!template || typeof template !== "string") {
    return template;
  }

  // Match {{variableName}} pattern
  // Supports nested dot notation: {{user.id}}, {{data.items.0.name}}
  const pattern = /\{\{([^{}]+)\}\}/g;

  return template.replace(pattern, (match, variablePath) => {
    const trimmedPath = variablePath.trim();

    // Handle nested paths like "user.id" or "data.items.0"
    const value = getNestedValue(context, trimmedPath);

    // If value not found, return original placeholder
    if (value === undefined) {
      return match;
    }

    // Convert to string if necessary
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Get a nested value from an object using dot notation
 *
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., "user.id", "data.items.0")
 * @returns {*} - Value at path or undefined
 */
function getNestedValue(obj, path) {
  if (!obj || !path) {
    return undefined;
  }

  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array index notation
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key];
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Interpolate variables in an object (recursively)
 * Useful for headers and body objects
 *
 * @param {Object|string} obj - Object or string to interpolate
 * @param {Object} context - Variable context
 * @returns {Object|string} - Interpolated object or string
 */
function interpolateObject(obj, context = {}) {
  if (!obj) {
    return obj;
  }

  if (typeof obj === "string") {
    return interpolate(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, context));
  }

  if (typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Interpolate both keys and values
      const interpolatedKey = interpolate(key, context);
      result[interpolatedKey] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

/**
 * Check if a string contains variable placeholders
 *
 * @param {string} str - String to check
 * @returns {boolean} - True if contains {{variable}} patterns
 */
function hasVariables(str) {
  if (!str || typeof str !== "string") {
    return false;
  }
  return /\{\{[^{}]+\}\}/.test(str);
}

/**
 * Extract variable names from a template
 *
 * @param {string} template - String containing {{variable}} placeholders
 * @returns {string[]} - Array of variable names found
 */
function extractVariableNames(template) {
  if (!template || typeof template !== "string") {
    return [];
  }

  const pattern = /\{\{([^{}]+)\}\}/g;
  const variables = [];
  let match;

  while ((match = pattern.exec(template)) !== null) {
    const varName = match[1].trim();
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }

  return variables;
}

/**
 * Validate that all required variables are present in context
 *
 * @param {string} template - String containing {{variable}} placeholders
 * @param {Object} context - Variable context
 * @returns {{ valid: boolean, missing: string[] }} - Validation result
 */
function validateVariables(template, context = {}) {
  const variables = extractVariableNames(template);
  const missing = [];

  for (const varName of variables) {
    // Handle nested paths by checking if the root exists
    const rootName = varName.split(".")[0];
    const value = getNestedValue(context, varName);

    if (value === undefined) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

module.exports = {
  interpolate,
  interpolateObject,
  hasVariables,
  extractVariableNames,
  validateVariables,
  getNestedValue,
};
