const path = require("path");
const {
  validateScenarioData,
  validatePhase,
  validateStep,
  sanitizeInput,
  parseScenarioJson,
  VALID_MODES,
  VALID_PHASE_TYPES,
  VALID_ERROR_HANDLING,
  VALID_HTTP_METHODS,
  VALID_EXTRACTOR_SOURCES,
} = require(path.join(
  __dirname,
  "../../../src/features/scenarios/scenarios.service"
));

describe("Scenarios Service - Unit Tests", () => {
  describe("Constants", () => {
    test("should have valid modes", () => {
      expect(VALID_MODES).toEqual(["simple", "workflow"]);
    });

    test("should have valid phase types", () => {
      expect(VALID_PHASE_TYPES).toEqual(["ramp", "constant", "spike"]);
    });

    test("should have valid error handling options", () => {
      expect(VALID_ERROR_HANDLING).toEqual(["abort", "retry", "ignore"]);
    });

    test("should have valid HTTP methods", () => {
      expect(VALID_HTTP_METHODS).toEqual(["GET", "POST", "PUT", "DELETE", "PATCH"]);
    });

    test("should have valid extractor sources", () => {
      expect(VALID_EXTRACTOR_SOURCES).toEqual(["body", "header", "cookie"]);
    });
  });

  describe("sanitizeInput", () => {
    test("should escape HTML entities", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    test("should trim whitespace", () => {
      const input = "  test scenario  ";
      const result = sanitizeInput(input);
      expect(result).toBe("test scenario");
    });

    test("should handle null input", () => {
      const result = sanitizeInput(null);
      expect(result).toBeNull();
    });

    test("should handle undefined input", () => {
      const result = sanitizeInput(undefined);
      expect(result).toBeUndefined();
    });

    test("should handle non-string input", () => {
      const result = sanitizeInput(123);
      expect(result).toBe(123);
    });
  });

  describe("validatePhase", () => {
    test("should validate a valid phase", () => {
      const phase = {
        name: "Test Phase",
        duration: 60,
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toHaveLength(0);
    });

    test("should reject phase without name", () => {
      const phase = {
        duration: 60,
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: name is required");
    });

    test("should reject phase with empty name", () => {
      const phase = {
        name: "  ",
        duration: 60,
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: name is required");
    });

    test("should reject phase without duration", () => {
      const phase = {
        name: "Test",
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: duration must be a positive number");
    });

    test("should reject phase with zero duration", () => {
      const phase = {
        name: "Test",
        duration: 0,
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: duration must be a positive number");
    });

    test("should reject phase with negative duration", () => {
      const phase = {
        name: "Test",
        duration: -10,
        connections: 10,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: duration must be a positive number");
    });

    test("should reject phase with negative connections", () => {
      const phase = {
        name: "Test",
        duration: 60,
        connections: -5,
        type: "constant",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: connections must be a non-negative number");
    });

    test("should allow phase with zero connections", () => {
      const phase = {
        name: "Cooldown",
        duration: 60,
        connections: 0,
        type: "ramp",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toHaveLength(0);
    });

    test("should reject phase with invalid type", () => {
      const phase = {
        name: "Test",
        duration: 60,
        connections: 10,
        type: "invalid",
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: type must be one of: ramp, constant, spike");
    });

    test("should validate optional rps field", () => {
      const phase = {
        name: "Test",
        duration: 60,
        connections: 10,
        type: "constant",
        rps: 100,
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toHaveLength(0);
    });

    test("should reject negative rps", () => {
      const phase = {
        name: "Test",
        duration: 60,
        connections: 10,
        type: "constant",
        rps: -10,
      };
      const errors = validatePhase(phase, 0);
      expect(errors).toContain("Phase 1: rps must be a non-negative number");
    });
  });

  describe("validateStep", () => {
    test("should validate a valid setup step", () => {
      const step = {
        name: "Create Resource",
        method: "POST",
        path: "/api/resources",
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toHaveLength(0);
    });

    test("should reject step without name", () => {
      const step = {
        method: "POST",
        path: "/api/resources",
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1: name is required");
    });

    test("should reject step without method", () => {
      const step = {
        name: "Test",
        path: "/api/resources",
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1: method must be one of: GET, POST, PUT, DELETE, PATCH");
    });

    test("should reject step with invalid method", () => {
      const step = {
        name: "Test",
        method: "INVALID",
        path: "/api/resources",
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1: method must be one of: GET, POST, PUT, DELETE, PATCH");
    });

    test("should reject step without path", () => {
      const step = {
        name: "Test",
        method: "POST",
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1: path is required");
    });

    test("should validate step with extractors", () => {
      const step = {
        name: "Create Resource",
        method: "POST",
        path: "/api/resources",
        extractors: [
          { name: "resourceId", source: "body", path: "id" },
        ],
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toHaveLength(0);
    });

    test("should reject extractor without name", () => {
      const step = {
        name: "Create Resource",
        method: "POST",
        path: "/api/resources",
        extractors: [
          { source: "body", path: "id" },
        ],
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1, extractor 1: name is required");
    });

    test("should reject extractor with invalid source", () => {
      const step = {
        name: "Create Resource",
        method: "POST",
        path: "/api/resources",
        extractors: [
          { name: "resourceId", source: "invalid", path: "id" },
        ],
      };
      const errors = validateStep(step, 0, "setup");
      expect(errors).toContain("setup step 1, extractor 1: source must be one of: body, header, cookie");
    });

    test("should validate workflow step with runOnce", () => {
      const step = {
        name: "Login",
        method: "POST",
        path: "/api/login",
        runOnce: true,
      };
      const errors = validateStep(step, 0, "workflow");
      expect(errors).toHaveLength(0);
    });

    test("should reject workflow step with invalid runOnce type", () => {
      const step = {
        name: "Login",
        method: "POST",
        path: "/api/login",
        runOnce: "yes",
      };
      const errors = validateStep(step, 0, "workflow");
      expect(errors).toContain("workflow step 1: runOnce must be a boolean");
    });
  });

  describe("validateScenarioData", () => {
    const validScenario = {
      name: "Test Scenario",
      description: "A test scenario",
      mode: "simple",
      phases: [
        { name: "Phase 1", duration: 60, connections: 10, type: "constant" },
      ],
    };

    test("should validate a valid scenario", () => {
      const result = validateScenarioData(validScenario);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject scenario without name", () => {
      const scenario = { ...validScenario, name: undefined };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });

    test("should reject scenario with empty name", () => {
      const scenario = { ...validScenario, name: "  " };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });

    test("should reject scenario with name too long", () => {
      const scenario = { ...validScenario, name: "a".repeat(256) };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Name must be at most 255 characters");
    });

    test("should reject scenario with description too long", () => {
      const scenario = { ...validScenario, description: "a".repeat(1001) };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Description must be at most 1000 characters");
    });

    test("should reject scenario with invalid mode", () => {
      const scenario = { ...validScenario, mode: "invalid" };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Mode must be one of: simple, workflow");
    });

    test("should reject scenario without phases", () => {
      const scenario = { ...validScenario, phases: undefined };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("At least one phase is required");
    });

    test("should reject scenario with empty phases array", () => {
      const scenario = { ...validScenario, phases: [] };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("At least one phase is required");
    });

    test("should validate scenario with setup steps", () => {
      const scenario = {
        ...validScenario,
        mode: "workflow",
        setup: [
          { name: "Setup", method: "POST", path: "/api/setup" },
        ],
      };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(true);
    });

    test("should reject setup that is not an array", () => {
      const scenario = {
        ...validScenario,
        setup: "not an array",
      };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Setup must be an array");
    });

    test("should validate error handling options", () => {
      const scenario = {
        ...validScenario,
        setupErrorHandling: "retry",
        setupRetryCount: 5,
        teardownErrorHandling: "ignore",
        teardownRetryCount: 3,
      };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(true);
    });

    test("should reject invalid setupErrorHandling", () => {
      const scenario = {
        ...validScenario,
        setupErrorHandling: "invalid",
      };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("setupErrorHandling must be one of: abort, retry, ignore");
    });

    test("should reject negative setupRetryCount", () => {
      const scenario = {
        ...validScenario,
        setupRetryCount: -1,
      };
      const result = validateScenarioData(scenario);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("setupRetryCount must be a non-negative number");
    });

    test("should skip name validation on update when not provided", () => {
      const scenario = {
        phases: [
          { name: "Phase 1", duration: 60, connections: 10, type: "constant" },
        ],
      };
      const result = validateScenarioData(scenario, true);
      expect(result.valid).toBe(true);
    });
  });

  describe("parseScenarioJson", () => {
    test("should parse JSON fields", () => {
      const scenario = {
        id: 1,
        name: "Test",
        phases: '[{"name":"Phase 1","duration":60,"connections":10,"type":"constant"}]',
        setup: '[{"name":"Setup","method":"POST","path":"/api/setup"}]',
        workflow: null,
        teardown: null,
      };
      const result = parseScenarioJson(scenario);
      expect(result.phases).toEqual([
        { name: "Phase 1", duration: 60, connections: 10, type: "constant" },
      ]);
      expect(result.setup).toEqual([
        { name: "Setup", method: "POST", path: "/api/setup" },
      ]);
      expect(result.workflow).toBeNull();
      expect(result.teardown).toBeNull();
    });

    test("should handle null scenario", () => {
      const result = parseScenarioJson(null);
      expect(result).toBeNull();
    });

    test("should handle scenario with no phases string", () => {
      const scenario = {
        id: 1,
        name: "Test",
        phases: null,
      };
      const result = parseScenarioJson(scenario);
      expect(result.phases).toEqual([]);
    });
  });
});
