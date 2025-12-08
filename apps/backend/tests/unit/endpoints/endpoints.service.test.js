const path = require("path");
const { validateEndpointData } = require(path.join(
  __dirname,
  "../../../src/features/endpoints/endpoints.service"
));

describe("Endpoints Service - Unit Tests", () => {
  describe("validateEndpointData", () => {
    test("should validate correct endpoint data", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should require name field", () => {
      const invalidData = {
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });

    test("should require name to be 1-255 characters", () => {
      const invalidData = {
        name: "",
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Name must be between 1 and 255 characters"
      );
    });

    test("should reject name longer than 255 characters", () => {
      const invalidData = {
        name: "a".repeat(256),
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Name must be between 1 and 255 characters"
      );
    });

    test("should require url field", () => {
      const invalidData = {
        name: "Test API",
        method: "GET",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("URL is required");
    });

    test("should validate URL format", () => {
      const invalidData = {
        name: "Test API",
        url: "not-a-url",
        method: "GET",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "URL must be valid (http:// or https://)"
      );
    });

    test("should accept valid http URL", () => {
      const validData = {
        name: "Test API",
        url: "http://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should accept valid https URL", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should validate method is one of allowed values", () => {
      const invalidData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "INVALID",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Method must be one of: GET, POST, PUT, DELETE, PATCH"
      );
    });

    test("should allow GET method", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should allow POST method", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "POST",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should validate headers is valid JSON if provided", () => {
      const invalidData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
        headers: "not-json",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Headers must be valid JSON");
    });

    test("should accept valid JSON headers", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
        headers: '{"Authorization": "Bearer token"}',
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should validate body is valid JSON if provided", () => {
      const invalidData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "POST",
        body: "not-json",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Body must be valid JSON");
    });

    test("should accept valid JSON body", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "POST",
        body: '{"key": "value"}',
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should accept empty string for optional fields", () => {
      const validData = {
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
        headers: "",
        body: "",
      };

      const result = validateEndpointData(validData);
      expect(result.valid).toBe(true);
    });

    test("should return multiple errors for multiple validation failures", () => {
      const invalidData = {
        name: "",
        url: "not-a-url",
        method: "INVALID",
        headers: "not-json",
      };

      const result = validateEndpointData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
