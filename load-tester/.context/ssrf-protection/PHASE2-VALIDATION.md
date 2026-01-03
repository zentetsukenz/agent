# Phase 2: SSRF Validation Functions

**Objective**: Implement URL validation logic to detect and block SSRF attacks

**Estimated time**: 30 minutes

---

## Files to Modify

### 1. `apps/backend/src/features/endpoints/endpoints.service.js`

**Current state**: Has `validateAndSanitizeURL()` that only checks http/https protocol

**Required changes**:

1. Add `isPrivateIP()` helper function
2. Add `isCloudMetadataEndpoint()` helper function  
3. Enhance `validateAndSanitizeURL()` with SSRF checks

---

## Implementation Details

### Add new helper functions BEFORE `validateAndSanitizeURL()`

```javascript
/**
 * Check if hostname is a private IP address
 * @param {string} hostname - Hostname or IP to check
 * @returns {boolean} - True if private IP
 */
function isPrivateIP(hostname) {
  // IPv4 private ranges
  const privateIPv4Patterns = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // Loopback 127.0.0.0/8
    /^169\.254\./,              // Link-local 169.254.0.0/16
    /^0\.0\.0\.0$/,             // Special 0.0.0.0
  ];

  // Check IPv4 patterns
  if (privateIPv4Patterns.some(pattern => pattern.test(hostname))) {
    return true;
  }

  // IPv6 private/local ranges (simplified check)
  const ipv6Patterns = [
    /^::1$/,                    // Loopback
    /^::/,                      // Unspecified
    /^fc00:/,                   // Unique local
    /^fd00:/,                   // Unique local
    /^fe80:/,                   // Link-local
  ];

  if (ipv6Patterns.some(pattern => pattern.test(hostname.toLowerCase()))) {
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
    '169.254.169.254',          // AWS/Azure/GCP
    'metadata.google.internal', // GCP
    'metadata.internal',        // GCP alternative
  ];

  return metadataEndpoints.includes(hostname.toLowerCase());
}
```

### Enhance `validateAndSanitizeURL()` function

**Replace the entire function** with this enhanced version:

```javascript
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
        error: "Access to private IP addresses is blocked in production. Contact admin to allowlist.",
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
```

### Update module exports

**Add new functions to exports** at the end of file:

```javascript
module.exports = {
  sanitizeInput,
  isPrivateIP,                    // NEW
  isCloudMetadataEndpoint,        // NEW
  validateAndSanitizeURL,
  validateEndpointData,
  getAllEndpoints,
  getEndpointById,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
};
```

---

## Context Required

Load before implementing:

```fish
cat ~/workspace/agent/load-tester/apps/backend/src/features/endpoints/endpoints.service.js
cat ~/workspace/agent/load-tester/apps/backend/src/config/index.js
```

---

## Implementation Strategy

1. Add `isPrivateIP()` function before `validateAndSanitizeURL()`
2. Add `isCloudMetadataEndpoint()` function after `isPrivateIP()`
3. Replace entire `validateAndSanitizeURL()` function with enhanced version
4. Update module.exports to include new functions
5. Maintain existing code style and JSDoc comments

---

## Verification Steps

```fish
# 1. Check syntax
cd ~/workspace/agent/load-tester/apps/backend
node -c src/features/endpoints/endpoints.service.js

# 2. Test private IP detection
node -e "const {isPrivateIP} = require('./src/features/endpoints/endpoints.service.js'); \
  console.log('10.0.0.1:', isPrivateIP('10.0.0.1')); \
  console.log('192.168.1.1:', isPrivateIP('192.168.1.1')); \
  console.log('8.8.8.8:', isPrivateIP('8.8.8.8'));"

# Expected output:
# 10.0.0.1: true
# 192.168.1.1: true
# 8.8.8.8: false

# 3. Test metadata endpoint detection
node -e "const {isCloudMetadataEndpoint} = require('./src/features/endpoints/endpoints.service.js'); \
  console.log('169.254.169.254:', isCloudMetadataEndpoint('169.254.169.254')); \
  console.log('google.com:', isCloudMetadataEndpoint('google.com'));"

# Expected:
# 169.254.169.254: true
# google.com: false

# 4. Test URL validation
node -e "const {validateAndSanitizeURL} = require('./src/features/endpoints/endpoints.service.js'); \
  console.log(JSON.stringify(validateAndSanitizeURL('http://169.254.169.254/'), null, 2));"

# Expected: { valid: false, error: "...", sanitized: null }
```

---

## Success Criteria

- [ ] `isPrivateIP()` correctly identifies all private IP ranges
- [ ] `isCloudMetadataEndpoint()` detects AWS/GCP/Azure metadata
- [ ] `validateAndSanitizeURL()` blocks according to config
- [ ] Blocklist checked before allowlist
- [ ] Error messages are clear and actionable
- [ ] No syntax errors
- [ ] Exports include new functions

---

## Pattern Reference

Follow existing patterns in endpoints.service.js:

- Use JSDoc comments for all functions
- Return structured objects with `{ valid, error, sanitized }`
- Use descriptive error messages
- Keep functions focused and testable
- Maintain consistent naming conventions

---

## Next Phase

After verification passes → Phase 3: Add integration tests
