/**
 * Endpoints Service
 * Business logic for endpoint management
 */

const validator = require("validator");
const { ValidationError, NotFoundError } = require("../../utils/errors");

/**
 * Sanitize text input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== "string") return input;

  // Escape HTML entities and trim whitespace
  return validator.escape(input).trim();
}

/**
 * Check if hostname is a private IP address
 * @param {string} hostname - Hostname or IP to check
 * @returns {boolean} - True if private IP
 */
function isPrivateIP(hostname) {
  // IPv4 private ranges
  const privateIPv4Patterns = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // Loopback 127.0.0.0/8
    /^169\.254\./, // Link-local 169.254.0.0/16
    /^0\.0\.0\.0$/, // Special 0.0.0.0
  ];

  // Check IPv4 patterns
  if (privateIPv4Patterns.some((pattern) => pattern.test(hostname))) {
    return true;
  }

  // IPv6 private/local ranges (simplified check)
  const ipv6Patterns = [
    /^::1$/, // Loopback
    /^::/, // Unspecified
    /^fc00:/, // Unique local
    /^fd00:/, // Unique local
    /^fe80:/, // Link-local
  ];

  if (ipv6Patterns.some((pattern) => pattern.test(hostname.toLowerCase()))) {
    return true;
  }

  return false;
}

/**
 * Check if hostname is a cloud metadata endpoint
 * @param {string} hostname - Hostname to check
 * @returns {boolean} - True if cloud metadata endpoint
 */
function isCloudMetadataEndpoint(hostname) {
  const metadataEndpoints = [
    "169.254.169.254", // AWS/Azure/GCP
    "metadata.google.internal", // GCP
    "metadata.internal", // GCP alternative
  ];

  return metadataEndpoints.includes(hostname.toLowerCase());
}

/**
 * Validate and sanitize URL with SSRF protection
 * @param {string} url - URL to validate
 * @returns {Object} - { valid: boolean, error: string|null, sanitized: string|null }
 */
function validateAndSanitizeURL(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required", sanitized: null };
  }

  const trimmedUrl = url.trim();

  // Parse URL first
  try {
    const urlObj = new URL(trimmedUrl);

    // Validate protocol
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must use http:// or https://",
        sanitized: null,
      };
    }

    const hostname = urlObj.hostname.toLowerCase();

    // Load config for SSRF checks
    const config = require("../../config");

    // 1. Check blocklist first (always blocked, highest priority)
    if (config.ssrf.blockedHosts.includes(hostname)) {
      return {
        valid: false,
        error: `Access to ${hostname} is blocked for security reasons`,
        sanitized: null,
      };
    }

    // 2. Check cloud metadata endpoints
    if (isCloudMetadataEndpoint(hostname)) {
      return {
        valid: false,
        error: "Access to cloud metadata endpoints is blocked for security",
        sanitized: null,
      };
    }

    // 3. Check allowlist (bypass private IP check)
    if (config.ssrf.allowlist.includes(hostname)) {
      return { valid: true, error: null, sanitized: trimmedUrl };
    }

    // 4. Check private IPs if blocking enabled
    if (config.ssrf.blockPrivateIPs && isPrivateIP(hostname)) {
      return {
        valid: false,
        error:
          "Access to private IP addresses is blocked in production. Contact admin to allowlist.",
        sanitized: null,
      };
    }

    // Valid URL - return sanitized version
    return { valid: true, error: null, sanitized: trimmedUrl };
  } catch (e) {
    return {
      valid: false,
      error: "URL must be valid (http:// or https://)",
      sanitized: null,
    };
  }
}

/**
 * Validate endpoint data
 * @param {Object} data - Endpoint data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateEndpointData(data) {
  const errors = [];

  // Validate and sanitize name
  if (!data.name) {
    errors.push("Name is required");
  } else if (typeof data.name === "string") {
    const trimmedName = data.name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 255) {
      errors.push("Name must be between 1 and 255 characters");
    }
  }

  // Validate URL with enhanced security checks
  const urlValidation = validateAndSanitizeURL(data.url);
  if (!urlValidation.valid) {
    errors.push(urlValidation.error);
  }

  // Validate method
  const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (data.method && !validMethods.includes(data.method)) {
    errors.push("Method must be one of: GET, POST, PUT, DELETE, PATCH");
  }

  // Validate headers (must be valid JSON if provided)
  if (
    data.headers &&
    typeof data.headers === "string" &&
    data.headers.trim() !== ""
  ) {
    try {
      const parsed = JSON.parse(data.headers);
      // Ensure it's an object
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        errors.push("Headers must be a valid JSON object");
      }
    } catch (e) {
      errors.push("Headers must be valid JSON: " + e.message);
    }
  }

  // Validate body (must be valid JSON if provided)
  if (data.body && typeof data.body === "string" && data.body.trim() !== "") {
    try {
      JSON.parse(data.body);
    } catch (e) {
      errors.push("Body must be valid JSON: " + e.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get all endpoints
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Array>} - List of endpoints
 */
async function getAllEndpoints(prisma) {
  return await prisma.endpoint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tests: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

/**
 * Get endpoint by ID
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Endpoint ID
 * @returns {Promise<Object|null>} - Endpoint or null
 */
async function getEndpointById(prisma, id) {
  const endpoint = await prisma.endpoint.findUnique({
    where: { id: parseInt(id) },
    include: {
      tests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!endpoint) {
    throw new NotFoundError("Endpoint");
  }

  return endpoint;
}

/**
 * Create new endpoint
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {Object} data - Endpoint data
 * @returns {Promise<Object>} - Created endpoint
 */
async function createEndpoint(prisma, data) {
  // Sanitize inputs
  const sanitizedName = sanitizeInput(data.name);
  const urlValidation = validateAndSanitizeURL(data.url);

  // Check if URL validation failed
  if (!urlValidation.valid) {
    throw new ValidationError(urlValidation.error);
  }

  const sanitizedUrl = urlValidation.sanitized;

  return await prisma.endpoint.create({
    data: {
      name: sanitizedName,
      url: sanitizedUrl,
      method: data.method || "GET",
      headers: data.headers && data.headers.trim() !== "" ? data.headers : null,
      body: data.body && data.body.trim() !== "" ? data.body : null,
    },
  });
}

/**
 * Update endpoint
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Endpoint ID
 * @param {Object} data - Updated endpoint data
 * @returns {Promise<Object>} - Updated endpoint
 */
async function updateEndpoint(prisma, id, data) {
  // Sanitize inputs
  const sanitizedName = sanitizeInput(data.name);
  const urlValidation = validateAndSanitizeURL(data.url);

  // Check if URL validation failed
  if (!urlValidation.valid) {
    throw new ValidationError(urlValidation.error);
  }

  const sanitizedUrl = urlValidation.sanitized;

  return await prisma.endpoint.update({
    where: { id: parseInt(id) },
    data: {
      name: sanitizedName,
      url: sanitizedUrl,
      method: data.method,
      headers: data.headers && data.headers.trim() !== "" ? data.headers : null,
      body: data.body && data.body.trim() !== "" ? data.body : null,
    },
  });
}

/**
 * Delete endpoint
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Endpoint ID
 * @returns {Promise<Object>} - Deleted endpoint
 */
async function deleteEndpoint(prisma, id) {
  return await prisma.endpoint.delete({
    where: { id: parseInt(id) },
  });
}

module.exports = {
  sanitizeInput,
  isPrivateIP,
  isCloudMetadataEndpoint,
  validateAndSanitizeURL,
  validateEndpointData,
  getAllEndpoints,
  getEndpointById,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
};
