/**
 * Sanitization Middleware Unit Tests
 */
const {
  sanitizeValue,
  sanitizeInput,
  unescapeJsonFields,
} = require("../../../src/middleware/sanitization");

describe("Sanitization Middleware", () => {
  describe("sanitizeValue", () => {
    test("should escape HTML entities in strings", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeValue(input);
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;"
      );
    });

    test("should trim whitespace from strings", () => {
      const input = "  hello world  ";
      const result = sanitizeValue(input);
      expect(result).toBe("hello world");
    });

    test("should escape and trim combined", () => {
      const input = "  <div>test</div>  ";
      const result = sanitizeValue(input);
      expect(result).toBe("&lt;div&gt;test&lt;&#x2F;div&gt;");
    });

    test("should recursively sanitize arrays", () => {
      const input = ["<script>", "normal", "<b>bold</b>"];
      const result = sanitizeValue(input);
      expect(result).toEqual([
        "&lt;script&gt;",
        "normal",
        "&lt;b&gt;bold&lt;&#x2F;b&gt;",
      ]);
    });

    test("should recursively sanitize nested objects", () => {
      const input = {
        name: "<script>evil</script>",
        nested: {
          value: "<img onerror='alert(1)'>",
        },
      };
      const result = sanitizeValue(input);
      expect(result.name).toBe("&lt;script&gt;evil&lt;&#x2F;script&gt;");
      expect(result.nested.value).toBe(
        "&lt;img onerror=&#x27;alert(1)&#x27;&gt;"
      );
    });

    test("should handle mixed arrays with objects", () => {
      const input = [{ name: "<b>test</b>" }, "plain", ["<i>nested</i>"]];
      const result = sanitizeValue(input);
      expect(result[0].name).toBe("&lt;b&gt;test&lt;&#x2F;b&gt;");
      expect(result[1]).toBe("plain");
      expect(result[2][0]).toBe("&lt;i&gt;nested&lt;&#x2F;i&gt;");
    });

    test("should return non-string primitives unchanged", () => {
      expect(sanitizeValue(123)).toBe(123);
      expect(sanitizeValue(true)).toBe(true);
      expect(sanitizeValue(false)).toBe(false);
      expect(sanitizeValue(null)).toBe(null);
      expect(sanitizeValue(undefined)).toBe(undefined);
    });

    test("should handle empty objects and arrays", () => {
      expect(sanitizeValue({})).toEqual({});
      expect(sanitizeValue([])).toEqual([]);
    });
  });

  describe("sanitizeInput middleware", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockReq = {
        body: null,
        query: null,
        params: null,
      };
      mockRes = {};
      mockNext = jest.fn();
    });

    test("should sanitize request body", () => {
      mockReq.body = { name: "<script>xss</script>" };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.name).toBe("&lt;script&gt;xss&lt;&#x2F;script&gt;");
      expect(mockNext).toHaveBeenCalled();
    });

    test("should sanitize query parameters", () => {
      mockReq.query = { search: "<img src=x onerror=alert(1)>" };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.query.search).toBe("&lt;img src=x onerror=alert(1)&gt;");
      expect(mockNext).toHaveBeenCalled();
    });

    test("should sanitize URL params", () => {
      mockReq.params = { id: "<script>hack</script>" };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.params.id).toBe("&lt;script&gt;hack&lt;&#x2F;script&gt;");
      expect(mockNext).toHaveBeenCalled();
    });

    test("should sanitize all three at once", () => {
      mockReq.body = { data: "<b>body</b>" };
      mockReq.query = { q: "<i>query</i>" };
      mockReq.params = { id: "<u>param</u>" };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.data).toBe("&lt;b&gt;body&lt;&#x2F;b&gt;");
      expect(mockReq.query.q).toBe("&lt;i&gt;query&lt;&#x2F;i&gt;");
      expect(mockReq.params.id).toBe("&lt;u&gt;param&lt;&#x2F;u&gt;");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("should handle null/undefined body, query, params", () => {
      mockReq.body = null;
      mockReq.query = undefined;
      mockReq.params = null;

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test("should handle non-object body", () => {
      mockReq.body = "string body";

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body).toBe("string body");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("unescapeJsonFields middleware", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockReq = { body: {} };
      mockRes = {};
      mockNext = jest.fn();
    });

    test("should unescape specified fields", () => {
      mockReq.body = {
        url: "https:&#x2F;&#x2F;example.com&#x2F;path",
        headers: "{&quot;key&quot;: &quot;value&quot;}",
      };

      const middleware = unescapeJsonFields("url", "headers");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.url).toBe("https://example.com/path");
      expect(mockReq.body.headers).toBe('{"key": "value"}');
      expect(mockNext).toHaveBeenCalled();
    });

    test("should not modify fields not in the list", () => {
      mockReq.body = {
        name: "&lt;script&gt;",
        url: "https:&#x2F;&#x2F;example.com",
      };

      const middleware = unescapeJsonFields("url");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.name).toBe("&lt;script&gt;"); // Not unescaped
      expect(mockReq.body.url).toBe("https://example.com"); // Unescaped
    });

    test("should handle missing fields gracefully", () => {
      mockReq.body = { other: "value" };

      const middleware = unescapeJsonFields("url", "headers");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual({ other: "value" });
      expect(mockNext).toHaveBeenCalled();
    });

    test("should handle null body", () => {
      mockReq.body = null;

      const middleware = unescapeJsonFields("url");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    test("should handle undefined body", () => {
      mockReq.body = undefined;

      const middleware = unescapeJsonFields("url");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    test("should skip non-string field values", () => {
      mockReq.body = {
        url: 123, // number, not string
        count: null,
      };

      const middleware = unescapeJsonFields("url", "count");
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.url).toBe(123);
      expect(mockReq.body.count).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    test("should work with no fields specified", () => {
      mockReq.body = { url: "https:&#x2F;&#x2F;example.com" };

      const middleware = unescapeJsonFields();
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.url).toBe("https:&#x2F;&#x2F;example.com");
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
