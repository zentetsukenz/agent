/**
 * Interpolate Utility Tests
 */

const {
  interpolate,
  interpolateObject,
  hasVariables,
  extractVariableNames,
  validateVariables,
  getNestedValue,
} = require("../../../src/utils/interpolate");

describe("interpolate utility", () => {
  describe("interpolate", () => {
    it("should replace single variable", () => {
      const result = interpolate("Hello {{name}}", { name: "World" });
      expect(result).toBe("Hello World");
    });

    it("should replace multiple variables", () => {
      const result = interpolate("{{greeting}} {{name}}!", {
        greeting: "Hello",
        name: "World",
      });
      expect(result).toBe("Hello World!");
    });

    it("should handle nested object paths", () => {
      const result = interpolate("User ID: {{user.id}}", {
        user: { id: 123 },
      });
      expect(result).toBe("User ID: 123");
    });

    it("should handle deeply nested paths", () => {
      const result = interpolate("Value: {{a.b.c.d}}", {
        a: { b: { c: { d: "deep" } } },
      });
      expect(result).toBe("Value: deep");
    });

    it("should leave unmatched variables unchanged", () => {
      const result = interpolate("{{found}} and {{notFound}}", { found: "A" });
      expect(result).toBe("A and {{notFound}}");
    });

    it("should handle empty context", () => {
      const result = interpolate("{{variable}}", {});
      expect(result).toBe("{{variable}}");
    });

    it("should handle null/undefined template", () => {
      expect(interpolate(null, { a: 1 })).toBe(null);
      expect(interpolate(undefined, { a: 1 })).toBe(undefined);
    });

    it("should handle non-string template", () => {
      expect(interpolate(123, { a: 1 })).toBe(123);
    });

    it("should convert object values to JSON", () => {
      const result = interpolate("Data: {{obj}}", {
        obj: { key: "value" },
      });
      expect(result).toBe('Data: {"key":"value"}');
    });

    it("should convert array values to JSON", () => {
      const result = interpolate("Items: {{arr}}", {
        arr: [1, 2, 3],
      });
      expect(result).toBe("Items: [1,2,3]");
    });

    it("should handle number values", () => {
      const result = interpolate("Count: {{count}}", { count: 42 });
      expect(result).toBe("Count: 42");
    });

    it("should handle boolean values", () => {
      const result = interpolate("Active: {{active}}", { active: true });
      expect(result).toBe("Active: true");
    });

    it("should handle variables with whitespace", () => {
      const result = interpolate("{{ name }}", { name: "Test" });
      expect(result).toBe("Test");
    });

    it("should handle URL paths", () => {
      const result = interpolate("/api/books/{{bookUid}}/accounts/{{accountUid}}", {
        bookUid: "abc123",
        accountUid: "def456",
      });
      expect(result).toBe("/api/books/abc123/accounts/def456");
    });

    it("should handle JSON body templates", () => {
      const template = '{"bookUid": "{{bookUid}}", "amount": {{amount}}}';
      const result = interpolate(template, { bookUid: "abc", amount: 100 });
      expect(result).toBe('{"bookUid": "abc", "amount": 100}');
    });
  });

  describe("getNestedValue", () => {
    it("should get simple value", () => {
      expect(getNestedValue({ a: 1 }, "a")).toBe(1);
    });

    it("should get nested value", () => {
      expect(getNestedValue({ a: { b: 2 } }, "a.b")).toBe(2);
    });

    it("should handle array index notation", () => {
      expect(getNestedValue({ items: ["a", "b", "c"] }, "items[1]")).toBe("b");
    });

    it("should handle nested array access", () => {
      expect(getNestedValue({ data: { items: [{ id: 1 }, { id: 2 }] } }, "data.items[0].id")).toBe(1);
    });

    it("should return undefined for missing path", () => {
      expect(getNestedValue({ a: 1 }, "b")).toBeUndefined();
    });

    it("should return undefined for null object", () => {
      expect(getNestedValue(null, "a")).toBeUndefined();
    });

    it("should return undefined for empty path", () => {
      expect(getNestedValue({ a: 1 }, "")).toBeUndefined();
    });

    it("should return undefined when traversing through null value", () => {
      expect(getNestedValue({ a: { b: null } }, "a.b.c")).toBeUndefined();
    });

    it("should return undefined when array notation used on non-array", () => {
      expect(getNestedValue({ items: "not-an-array" }, "items[0]")).toBeUndefined();
    });

    it("should return undefined when array notation used on object", () => {
      expect(getNestedValue({ data: { value: 123 } }, "data[0]")).toBeUndefined();
    });
  });

  describe("interpolateObject", () => {
    it("should interpolate string values", () => {
      const result = interpolateObject({ url: "/api/{{id}}" }, { id: 123 });
      expect(result).toEqual({ url: "/api/123" });
    });

    it("should interpolate nested objects", () => {
      const result = interpolateObject(
        {
          request: {
            url: "{{baseUrl}}/users",
            headers: { "X-Token": "{{token}}" },
          },
        },
        { baseUrl: "http://api.example.com", token: "abc123" }
      );
      expect(result).toEqual({
        request: {
          url: "http://api.example.com/users",
          headers: { "X-Token": "abc123" },
        },
      });
    });

    it("should interpolate arrays", () => {
      const result = interpolateObject(["{{a}}", "{{b}}"], { a: 1, b: 2 });
      expect(result).toEqual(["1", "2"]);
    });

    it("should handle non-object values", () => {
      expect(interpolateObject(null, {})).toBe(null);
      expect(interpolateObject(123, {})).toBe(123);
    });
  });

  describe("hasVariables", () => {
    it("should return true for string with variables", () => {
      expect(hasVariables("Hello {{name}}")).toBe(true);
    });

    it("should return false for string without variables", () => {
      expect(hasVariables("Hello World")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(hasVariables(null)).toBe(false);
      expect(hasVariables(undefined)).toBe(false);
    });

    it("should return false for non-strings", () => {
      expect(hasVariables(123)).toBe(false);
      expect(hasVariables({ a: 1 })).toBe(false);
    });

    it("should detect multiple variables", () => {
      expect(hasVariables("{{a}} and {{b}}")).toBe(true);
    });
  });

  describe("extractVariableNames", () => {
    it("should extract single variable name", () => {
      expect(extractVariableNames("{{name}}")).toEqual(["name"]);
    });

    it("should extract multiple variable names", () => {
      expect(extractVariableNames("{{a}} {{b}} {{c}}")).toEqual(["a", "b", "c"]);
    });

    it("should extract nested path names", () => {
      expect(extractVariableNames("{{user.id}} {{user.name}}")).toEqual(["user.id", "user.name"]);
    });

    it("should not duplicate variable names", () => {
      expect(extractVariableNames("{{id}} {{id}} {{id}}")).toEqual(["id"]);
    });

    it("should return empty array for no variables", () => {
      expect(extractVariableNames("no variables")).toEqual([]);
    });

    it("should return empty array for null/undefined", () => {
      expect(extractVariableNames(null)).toEqual([]);
      expect(extractVariableNames(undefined)).toEqual([]);
    });

    it("should trim variable names", () => {
      expect(extractVariableNames("{{ name }}")).toEqual(["name"]);
    });
  });

  describe("validateVariables", () => {
    it("should return valid for all present variables", () => {
      const result = validateVariables("{{a}} {{b}}", { a: 1, b: 2 });
      expect(result).toEqual({ valid: true, missing: [] });
    });

    it("should return missing variables", () => {
      const result = validateVariables("{{a}} {{b}} {{c}}", { a: 1 });
      expect(result).toEqual({ valid: false, missing: ["b", "c"] });
    });

    it("should validate nested paths", () => {
      const result = validateVariables("{{user.id}}", { user: { id: 1 } });
      expect(result).toEqual({ valid: true, missing: [] });
    });

    it("should detect missing nested paths", () => {
      const result = validateVariables("{{user.email}}", { user: { id: 1 } });
      expect(result).toEqual({ valid: false, missing: ["user.email"] });
    });

    it("should handle empty context", () => {
      const result = validateVariables("{{a}}", {});
      expect(result).toEqual({ valid: false, missing: ["a"] });
    });

    it("should handle no variables", () => {
      const result = validateVariables("no variables", {});
      expect(result).toEqual({ valid: true, missing: [] });
    });
  });
});
