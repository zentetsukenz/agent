# Phase 4: Unit Tests for SSRF Validation Functions

**Objective**: Add comprehensive unit tests for SSRF validation helper functions

**Estimated time**: 30 minutes

---

## Files to Create/Modify

### 1. `apps/backend/tests/unit/endpoints/endpoints.service.test.js`

**Current state**: May or may not exist

**Required changes**: Create or enhance with SSRF validation tests

---

## Implementation Details

### If file doesn't exist, create it with this structure

```javascript
/**
 * Unit tests for endpoints service
 * Tests business logic in isolation with mocked dependencies
 */

const {
  isPrivateIP,
  isCloudMetadataEndpoint,
  validateAndSanitizeURL,
} = require("../../../src/features/endpoints/endpoints.service");

describe("EndpointService - SSRF Protection", () => {
  describe("isPrivateIP", () => {
    test("should detect 10.x.x.x range", () => {
      expect(isPrivateIP("10.0.0.1")).toBe(true);
      expect(isPrivateIP("10.255.255.255")).toBe(true);
      expect(isPrivateIP("10.1.2.3")).toBe(true);
    });

    test("should detect 192.168.x.x range", () => {
      expect(isPrivateIP("192.168.0.1")).toBe(true);
      expect(isPrivateIP("192.168.255.255")).toBe(true);
      expect(isPrivateIP("192.168.1.100")).toBe(true);
    });

    test("should detect 172.16-31.x.x range", () => {
      expect(isPrivateIP("172.16.0.1")).toBe(true);
      expect(isPrivateIP("172.31.255.255")).toBe(true);
      expect(isPrivateIP("172.20.10.5")).toBe(true);
    });

    test("should detect loopback 127.x.x.x", () => {
      expect(isPrivateIP("127.0.0.1")).toBe(true);
      expect(isPrivateIP("127.255.255.255")).toBe(true);
    });

    test("should detect link-local 169.254.x.x", () => {
      expect(isPrivateIP("169.254.169.254")).toBe(true);
      expect(isPrivateIP("169.254.0.1")).toBe(true);
    });

    test("should detect special 0.0.0.0", () => {
      expect(isPrivateIP("0.0.0.0")).toBe(true);
    });

    test("should detect IPv6 loopback ::1", () => {
      expect(isPrivateIP("::1")).toBe(true);
    });

    test("should detect IPv6 unique local fc00::/7", () => {
      expect(isPrivateIP("fc00::1")).toBe(true);
      expect(isPrivateIP("fd00::1")).toBe(true);
    });

    test("should detect IPv6 link-local fe80::/10", () => {
      expect(isPrivateIP("fe80::1")).toBe(true);
    });

    test("should NOT detect public IPs as private", () => {
      expect(isPrivateIP("8.8.8.8")).toBe(false);
      expect(isPrivateIP("1.1.1.1")).toBe(false);
      expect(isPrivateIP("93.184.216.34")).toBe(false); // example.com
      expect(isPrivateIP("151.101.1.69")).toBe(false); // public IP
    });

    test("should NOT detect hostnames as private IPs", () => {
      expect(isPrivateIP("google.com")).toBe(false);
      expect(isPrivateIP("api.example.com")).toBe(false);
      expect(isPrivateIP("localhost")).toBe(false); // hostname, not IP
    });
  });

  describe("isCloudMetadataEndpoint", () => {
    test("should detect AWS/Azure metadata IP", () => {
      expect(isCloudMetadataEndpoint("169.254.169.254")).toBe(true);
    });

    test("should detect GCP metadata hostnames", () => {
      expect(isCloudMetadataEndpoint("metadata.google.internal")).toBe(true);
      expect(isCloudMetadataEndpoint("metadata.internal")).toBe(true);
    });

    test("should be case-insensitive", () => {
      expect(isCloudMetadataEndpoint("METADATA.GOOGLE.INTERNAL")).toBe(true);
      expect(isCloudMetadataEndpoint("Metadata.Internal")).toBe(true);
    });

    test("should NOT detect normal domains", () => {
      expect(isCloudMetadataEndpoint("example.com")).toBe(false);
      expect(isCloudMetadataEndpoint("api.google.com")).toBe(false);
      expect(isCloudMetadataEndpoint("metadata.example.com")).toBe(false);
    });
  });

  describe("validateAndSanitizeURL - SSRF scenarios", () => {
    // Mock config module
    beforeEach(() => {
      // Reset modules to get fresh config
      jest.resetModules();
    });

    test("should block cloud metadata endpoints", () => {
      const result = validateAndSanitizeURL(
        "http://169.254.169.254/latest/meta-data"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("metadata");
    });

    test("should block GCP metadata hostname", () => {
      const result = validateAndSanitizeURL(
        "http://metadata.google.internal/computeMetadata/v1/"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("should block localhost from blocklist", () => {
      const result = validateAndSanitizeURL("http://localhost:8080/admin");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("blocked");
    });

    test("should block 127.0.0.1 from blocklist", () => {
      const result = validateAndSanitizeURL("http://127.0.0.1:8080/admin");
      expect(result.valid).toBe(false);
    });

    test("should block IPv6 loopback ::1 from blocklist", () => {
      const result = validateAndSanitizeURL("http://[::1]:8080/admin");
      expect(result.valid).toBe(false);
    });

    test("should allow public domains", () => {
      const result = validateAndSanitizeURL("https://api.example.com/v1/users");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("https://api.example.com/v1/users");
    });

    test("should allow public IPs", () => {
      const result = validateAndSanitizeURL("http://8.8.8.8:80");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("http://8.8.8.8:80");
    });

    test("should still block invalid protocols", () => {
      const result = validateAndSanitizeURL("ftp://example.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("http");
    });

    test("should still block malformed URLs", () => {
      const result = validateAndSanitizeURL("not a url");
      expect(result.valid).toBe(false);
    });

    test("should return clear error messages", () => {
      const result = validateAndSanitizeURL("http://169.254.169.254/");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error.length).toBeGreaterThan(10);
    });

    test("should handle URLs with paths and query params", () => {
      const result = validateAndSanitizeURL(
        "https://api.example.com/v1/users?page=1&limit=10"
      );
      expect(result.valid).toBe(true);
    });
  });
});
```

### If file exists, append the test suites to existing content

---

## Context Required

Load before implementing:

```fish
# Check if file exists
ls -la ~/workspace/agent/load-tester/apps/backend/tests/unit/endpoints/

# If exists, load it
cat ~/workspace/agent/load-tester/apps/backend/tests/unit/endpoints/endpoints.service.test.js

# Load the service being tested
cat ~/workspace/agent/load-tester/apps/backend/src/features/endpoints/endpoints.service.js
```

---

## Implementation Strategy

1. Check if tests/unit/endpoints/ directory exists (create if not)
2. Check if endpoints.service.test.js exists
3. If not, create with full structure above
4. If exists, append the test suites
5. Ensure proper indentation and structure
6. Follow existing test patterns if file exists

---

## Verification Steps

```fish
# 1. Run unit tests
cd ~/workspace/agent/load-tester/apps/backend
npm test -- tests/unit/endpoints/endpoints.service.test.js

# 2. Run with coverage
npm test -- --coverage tests/unit/endpoints/endpoints.service.test.js

# 3. Run all unit tests
npm test -- tests/unit/

# Expected: All tests pass, coverage at or above 80%
```

---

## Success Criteria

- [ ] All unit tests pass
- [ ] `isPrivateIP()` tested for all ranges (10.x, 192.168.x, 172.16-31.x, 127.x, 169.254.x)
- [ ] IPv6 ranges tested (::1, fc00::, fe80::)
- [ ] Public IPs correctly identified as non-private
- [ ] `isCloudMetadataEndpoint()` tested for AWS/GCP/Azure
- [ ] `validateAndSanitizeURL()` SSRF scenarios covered
- [ ] Error messages verified
- [ ] Edge cases tested (case sensitivity, paths, query params)
- [ ] Coverage at or above 80%

---

## Pattern Reference

Follow Jest unit test patterns:

- Group tests in `describe` blocks by function
- Use descriptive test names starting with "should"
- Test both positive and negative cases
- Test edge cases (empty, null, malformed)
- Use `beforeEach` for setup, `afterEach` for cleanup
- Keep tests independent and isolated

---

## Next Phase

After verification passes → Phase 5: Update environment configuration docs
