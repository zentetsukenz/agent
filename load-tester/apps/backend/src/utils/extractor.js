/**
 * Variable Extractor Utility
 * Extracts values from HTTP responses using JSONata expressions
 */

const jsonata = require("jsonata");
const logger = require("./logger");

/**
 * Extract a value from response body using JSONata
 *
 * @param {Object|string} body - Response body (object or JSON string)
 * @param {string} path - JSONata expression (e.g., "uid", "data.user.id", "items[0].name")
 * @returns {*} - Extracted value or undefined
 *
 * @example
 * extractFromBody({ data: { id: 123 } }, "data.id")
 * // Returns: 123
 *
 * extractFromBody({ items: [{ name: "A" }, { name: "B" }] }, "items[0].name")
 * // Returns: "A"
 */
async function extractFromBody(body, path) {
  if (!body || !path) {
    return undefined;
  }

  try {
    // Parse JSON string if needed
    const data = typeof body === "string" ? JSON.parse(body) : body;

    // Compile and evaluate JSONata expression
    const expression = jsonata(path);
    const result = await expression.evaluate(data);

    return result;
  } catch (error) {
    logger.debug("JSONata extraction failed", {
      path,
      error: error.message,
    });
    return undefined;
  }
}

/**
 * Extract a value from response headers
 *
 * @param {Object} headers - Response headers object (case-insensitive lookup)
 * @param {string} headerName - Header name to extract
 * @returns {string|undefined} - Header value or undefined
 *
 * @example
 * extractFromHeader({ "Content-Type": "application/json", "X-Request-Id": "abc123" }, "x-request-id")
 * // Returns: "abc123"
 */
function extractFromHeader(headers, headerName) {
  if (!headers || !headerName) {
    return undefined;
  }

  // Headers are case-insensitive in HTTP
  const normalizedName = headerName.toLowerCase();

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract a cookie value from Set-Cookie header or cookies object
 *
 * @param {string|string[]|Object} cookies - Set-Cookie header(s) or cookies object
 * @param {string} cookieName - Cookie name to extract
 * @returns {string|undefined} - Cookie value or undefined
 *
 * @example
 * extractFromCookie("session=abc123; Path=/; HttpOnly", "session")
 * // Returns: "abc123"
 *
 * extractFromCookie(["session=abc123; Path=/", "token=xyz; Path=/"], "token")
 * // Returns: "xyz"
 */
function extractFromCookie(cookies, cookieName) {
  if (!cookies || !cookieName) {
    return undefined;
  }

  // If cookies is already an object
  if (typeof cookies === "object" && !Array.isArray(cookies)) {
    return cookies[cookieName];
  }

  // Normalize to array
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

  for (const cookieStr of cookieArray) {
    if (typeof cookieStr !== "string") continue;

    // Parse cookie string: "name=value; attr1; attr2=val2"
    const parts = cookieStr.split(";");
    const [nameValue] = parts;

    if (nameValue) {
      const [name, ...valueParts] = nameValue.split("=");
      const trimmedName = name.trim();
      const value = valueParts.join("=").trim(); // Handle values with = in them

      if (trimmedName === cookieName) {
        return value;
      }
    }
  }

  return undefined;
}

/**
 * Apply extractors to a response and return extracted variables
 *
 * @param {Object} response - HTTP response object
 * @param {Object} response.body - Response body (object or string)
 * @param {Object} response.headers - Response headers
 * @param {Array<Object>} extractors - Array of extractor configurations
 * @param {string} extractors[].name - Variable name to assign
 * @param {string} extractors[].source - "body" | "header" | "cookie"
 * @param {string} extractors[].path - JSONata path (for body) or header/cookie name
 * @returns {Promise<Object>} - Object with extracted variables
 *
 * @example
 * const response = {
 *   body: { uid: "abc123", data: { name: "Test" } },
 *   headers: { "x-request-id": "req-456" }
 * };
 * const extractors = [
 *   { name: "bookUid", source: "body", path: "uid" },
 *   { name: "requestId", source: "header", path: "x-request-id" }
 * ];
 * await applyExtractors(response, extractors)
 * // Returns: { bookUid: "abc123", requestId: "req-456" }
 */
async function applyExtractors(response, extractors = []) {
  if (!extractors || extractors.length === 0) {
    return {};
  }

  const extracted = {};

  for (const extractor of extractors) {
    const { name, source, path } = extractor;

    if (!name) {
      logger.warn("Extractor missing name", { extractor });
      continue;
    }

    let value;

    switch (source) {
      case "body":
        value = await extractFromBody(response.body, path);
        break;

      case "header":
        value = extractFromHeader(response.headers, path);
        break;

      case "cookie":
        // Try Set-Cookie header first, then cookies object
        const setCookie = response.headers?.["set-cookie"] || response.headers?.["Set-Cookie"];
        value = extractFromCookie(setCookie || response.cookies, path);
        break;

      default:
        logger.warn("Unknown extractor source", { source, name });
        continue;
    }

    if (value !== undefined) {
      extracted[name] = value;
      logger.debug("Extracted variable", { name, source, path, value });
    } else {
      logger.debug("Extraction returned undefined", { name, source, path });
    }
  }

  return extracted;
}

/**
 * Synchronous version of extractFromBody for simple paths
 * Falls back to simple dot notation if JSONata is overkill
 *
 * @param {Object|string} body - Response body
 * @param {string} path - Simple dot notation path (e.g., "data.id", "user.name")
 * @returns {*} - Extracted value or undefined
 */
function extractFromBodySync(body, path) {
  if (!body || !path) {
    return undefined;
  }

  try {
    const data = typeof body === "string" ? JSON.parse(body) : body;

    // Simple dot notation extraction (no JSONata)
    const parts = path.split(".");
    let current = data;

    for (const part of parts) {
      // Handle array notation: items[0]
      const match = part.match(/^(\w+)\[(\d+)\]$/);
      if (match) {
        const [, key, index] = match;
        current = current?.[key]?.[parseInt(index, 10)];
      } else {
        current = current?.[part];
      }

      if (current === undefined) {
        return undefined;
      }
    }

    return current;
  } catch (error) {
    return undefined;
  }
}

module.exports = {
  extractFromBody,
  extractFromBodySync,
  extractFromHeader,
  extractFromCookie,
  applyExtractors,
};
