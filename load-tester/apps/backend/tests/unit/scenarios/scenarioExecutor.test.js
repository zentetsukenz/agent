/**
 * Scenario Executor Tests
 * Unit tests for scenario execution logic (phase calculations, result formatting, aggregation)
 */

const {
  calculateRampSteps,
  expandPhasesToSteps,
  formatPhaseResult,
  aggregateStepResults,
  aggregateAllPhaseResults,
  RAMP_INTERVAL,
} = require("../../../src/features/scenarios/scenarioExecutor");

describe("scenarioExecutor", () => {
  describe("calculateRampSteps", () => {
    it("should return single step for duration <= RAMP_INTERVAL", () => {
      const steps = calculateRampSteps(0, 50, 5);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({ connections: 50, duration: 5 });
    });

    it("should return single step for duration less than interval", () => {
      const steps = calculateRampSteps(10, 30, 3);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({ connections: 30, duration: 3 });
    });

    it("should split into multiple steps for longer durations", () => {
      const steps = calculateRampSteps(0, 50, 30);
      // 30 / 5 = 6 steps
      expect(steps).toHaveLength(6);

      // Each step should have 5 seconds duration
      steps.forEach((step) => {
        expect(step.duration).toBe(5);
      });

      // Connections should ramp up gradually
      expect(steps[0].connections).toBe(8); // ~8.33 rounded
      expect(steps[5].connections).toBe(50); // Final target
    });

    it("should handle ramp down (decreasing connections)", () => {
      const steps = calculateRampSteps(50, 10, 20);
      // 20 / 5 = 4 steps
      expect(steps).toHaveLength(4);

      // Connections should decrease
      expect(steps[0].connections).toBe(40);
      expect(steps[3].connections).toBe(10);
    });

    it("should handle ramp to zero (minimum 1 connection)", () => {
      const steps = calculateRampSteps(50, 0, 25);
      // 25 / 5 = 5 steps
      expect(steps).toHaveLength(5);

      // Final step should have at least 1 connection
      expect(steps[4].connections).toBeGreaterThanOrEqual(1);
    });

    it("should handle same start and end connections", () => {
      const steps = calculateRampSteps(30, 30, 15);
      // 15 / 5 = 3 steps
      expect(steps).toHaveLength(3);

      // All steps should have same connections
      steps.forEach((step) => {
        expect(step.connections).toBe(30);
      });
    });

    it("should handle odd duration values", () => {
      const steps = calculateRampSteps(0, 100, 13);
      // ceil(13 / 5) = 3 steps
      expect(steps).toHaveLength(3);

      // Duration should be evenly split
      const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
      expect(totalDuration).toBeCloseTo(13, 5);
    });
  });

  describe("expandPhasesToSteps", () => {
    it("should keep constant phases as single steps", () => {
      const phases = [
        { name: "Constant Load", duration: 60, connections: 50, type: "constant" },
      ];

      const steps = expandPhasesToSteps(phases);

      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        name: "Constant Load",
        connections: 50,
        duration: 60,
        isPartOfRamp: false,
      });
    });

    it("should keep spike phases as single steps", () => {
      const phases = [
        { name: "Spike", duration: 30, connections: 200, type: "spike" },
      ];

      const steps = expandPhasesToSteps(phases);

      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        name: "Spike",
        connections: 200,
        duration: 30,
        isPartOfRamp: false,
      });
    });

    it("should expand ramp phases into micro-steps", () => {
      const phases = [
        { name: "Ramp Up", duration: 30, connections: 50, type: "ramp" },
      ];

      const steps = expandPhasesToSteps(phases);

      // 30 / 5 = 6 micro-steps
      expect(steps).toHaveLength(6);

      // All steps should be marked as part of ramp
      steps.forEach((step) => {
        expect(step.isPartOfRamp).toBe(true);
        expect(step.parentPhaseName).toBe("Ramp Up");
      });
    });

    it("should handle multiple phases with different types", () => {
      const phases = [
        { name: "Ramp Up", duration: 10, connections: 50, type: "ramp" },
        { name: "Sustain", duration: 60, connections: 50, type: "constant" },
        { name: "Ramp Down", duration: 10, connections: 0, type: "ramp" },
      ];

      const steps = expandPhasesToSteps(phases);

      // 2 ramp steps + 1 constant + 2 ramp steps = 5
      expect(steps.length).toBeGreaterThanOrEqual(3);

      // Check phase indices are set
      const phaseIndices = [...new Set(steps.map((s) => s.phaseIndex))];
      expect(phaseIndices).toEqual([0, 1, 2]);
    });

    it("should use previous phase connections as ramp start", () => {
      const phases = [
        { name: "Sustain", duration: 60, connections: 100, type: "constant" },
        { name: "Ramp Down", duration: 20, connections: 10, type: "ramp" },
      ];

      const steps = expandPhasesToSteps(phases);

      // First step is constant at 100
      expect(steps[0].connections).toBe(100);

      // Ramp steps should start from ~100 and go to 10
      const rampSteps = steps.filter((s) => s.isPartOfRamp);
      expect(rampSteps[0].connections).toBeLessThan(100);
      expect(rampSteps[rampSteps.length - 1].connections).toBe(10);
    });

    it("should preserve rps setting", () => {
      const phases = [
        { name: "Rate Limited", duration: 60, connections: 50, type: "constant", rps: 1000 },
      ];

      const steps = expandPhasesToSteps(phases);

      expect(steps[0].rps).toBe(1000);
    });

    it("should ensure minimum 1 connection", () => {
      const phases = [
        { name: "Zero Connections", duration: 30, connections: 0, type: "constant" },
      ];

      const steps = expandPhasesToSteps(phases);

      expect(steps[0].connections).toBeGreaterThanOrEqual(1);
    });
  });

  describe("formatPhaseResult", () => {
    const mockRawResult = {
      requests: { total: 1000, average: 100, sent: 1000 },
      latency: { min: 1, max: 100, mean: 25, p50: 20, p90: 50, p95: 60, p99: 80 },
      throughput: { average: 50000, total: 500000 },
      errors: 5,
      timeouts: 2,
      duration: 10,
    };

    it("should format raw results into PhaseResult structure", () => {
      const result = formatPhaseResult(mockRawResult, "Test Phase", 10);

      expect(result.phaseName).toBe("Test Phase");
      expect(result.duration).toBe(10);
      expect(result.requests).toEqual({ total: 1000, average: 100, sent: 1000 });
      expect(result.latency).toEqual({
        min: 1,
        max: 100,
        mean: 25,
        p50: 20,
        p90: 50,
        p95: 60,
        p99: 80,
      });
      expect(result.throughput).toEqual({ average: 50000, total: 500000 });
      expect(result.errors).toBe(5);
      expect(result.timeouts).toBe(2);
    });

    it("should handle missing values with defaults", () => {
      const result = formatPhaseResult({}, "Empty Phase", 30);

      expect(result.phaseName).toBe("Empty Phase");
      expect(result.duration).toBe(30);
      expect(result.requests).toEqual({ total: 0, average: 0, sent: 0 });
      expect(result.latency).toEqual({
        min: 0,
        max: 0,
        mean: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
      });
      expect(result.throughput).toEqual({ average: 0, total: 0 });
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
    });

    it("should use actual duration if provided in results", () => {
      const result = formatPhaseResult(
        { ...mockRawResult, duration: 12 },
        "Phase",
        10
      );

      expect(result.duration).toBe(12);
    });
  });

  describe("aggregateStepResults", () => {
    it("should return empty result for empty input", () => {
      const result = aggregateStepResults([], "Empty");

      expect(result.phaseName).toBe("Empty");
      expect(result.requests.total).toBe(0);
    });

    it("should return single result unchanged (except phaseName)", () => {
      const singleResult = {
        phaseName: "Step 1",
        duration: 5,
        requests: { total: 100, average: 20, sent: 100 },
        latency: { min: 1, max: 10, mean: 5, p50: 4, p90: 8, p95: 9, p99: 10 },
        throughput: { average: 1000, total: 5000 },
        errors: 0,
        timeouts: 0,
      };

      const result = aggregateStepResults([singleResult], "Aggregated");

      expect(result.phaseName).toBe("Aggregated");
      expect(result.duration).toBe(5);
      expect(result.requests.total).toBe(100);
    });

    it("should aggregate multiple step results correctly", () => {
      const stepResults = [
        {
          phaseName: "Step 1",
          duration: 5,
          requests: { total: 100, average: 20, sent: 100 },
          latency: { min: 1, max: 10, mean: 5, p50: 4, p90: 8, p95: 9, p99: 10 },
          throughput: { average: 1000, total: 5000 },
          errors: 1,
          timeouts: 0,
        },
        {
          phaseName: "Step 2",
          duration: 5,
          requests: { total: 200, average: 40, sent: 200 },
          latency: { min: 2, max: 20, mean: 10, p50: 8, p90: 16, p95: 18, p99: 20 },
          throughput: { average: 2000, total: 10000 },
          errors: 2,
          timeouts: 1,
        },
      ];

      const result = aggregateStepResults(stepResults, "Combined");

      expect(result.phaseName).toBe("Combined");
      expect(result.duration).toBe(10); // 5 + 5
      expect(result.requests.total).toBe(300); // 100 + 200
      expect(result.requests.sent).toBe(300);
      expect(result.errors).toBe(3); // 1 + 2
      expect(result.timeouts).toBe(1); // 0 + 1
      expect(result.throughput.total).toBe(15000); // 5000 + 10000

      // Latency should be weighted by request count
      // min should be minimum of all
      expect(result.latency.min).toBe(1);
      // max should be maximum of all
      expect(result.latency.max).toBe(20);
    });

    it("should calculate weighted average for latency", () => {
      const stepResults = [
        {
          phaseName: "Step 1",
          duration: 5,
          requests: { total: 100, average: 20, sent: 100 },
          latency: { min: 10, max: 100, mean: 50, p50: 40, p90: 80, p95: 90, p99: 95 },
          throughput: { average: 1000, total: 5000 },
          errors: 0,
          timeouts: 0,
        },
        {
          phaseName: "Step 2",
          duration: 5,
          requests: { total: 100, average: 20, sent: 100 },
          latency: { min: 20, max: 200, mean: 100, p50: 80, p90: 160, p95: 180, p99: 190 },
          throughput: { average: 1000, total: 5000 },
          errors: 0,
          timeouts: 0,
        },
      ];

      const result = aggregateStepResults(stepResults, "Combined");

      // With equal request counts, mean should be average of both
      expect(result.latency.mean).toBe(75); // (50 + 100) / 2
      expect(result.latency.p50).toBe(60); // (40 + 80) / 2
    });
  });

  describe("aggregateAllPhaseResults", () => {
    it("should return empty result for empty input", () => {
      const result = aggregateAllPhaseResults([]);

      expect(result.requests.total).toBe(0);
      expect(result.duration).toBe(0);
      expect(result.successRate).toBe(0);
    });

    it("should aggregate multiple phase results", () => {
      const phaseResults = [
        {
          phaseName: "Ramp Up",
          duration: 30,
          requests: { total: 1000, average: 33.33, sent: 1000 },
          latency: { min: 1, max: 100, mean: 25, p50: 20, p90: 50, p95: 60, p99: 80 },
          throughput: { average: 10000, total: 300000 },
          errors: 10,
          timeouts: 5,
        },
        {
          phaseName: "Sustain",
          duration: 120,
          requests: { total: 10000, average: 83.33, sent: 10000 },
          latency: { min: 2, max: 150, mean: 30, p50: 25, p90: 60, p95: 70, p99: 90 },
          throughput: { average: 100000, total: 12000000 },
          errors: 50,
          timeouts: 10,
        },
      ];

      const result = aggregateAllPhaseResults(phaseResults);

      expect(result.duration).toBe(150); // 30 + 120
      expect(result.requests.total).toBe(11000); // 1000 + 10000
      expect(result.requests.sent).toBe(11000);
      expect(result.errors).toBe(60); // 10 + 50
      expect(result.timeouts).toBe(15); // 5 + 10
      expect(result.throughput.total).toBe(12300000); // 300000 + 12000000

      // Min latency should be minimum across phases
      expect(result.latency.min).toBe(1);
      // Max latency should be maximum across phases
      expect(result.latency.max).toBe(150);
    });

    it("should calculate correct success rate", () => {
      const phaseResults = [
        {
          phaseName: "Test",
          duration: 60,
          requests: { total: 1000, average: 16.67, sent: 1000 },
          latency: { min: 1, max: 10, mean: 5, p50: 4, p90: 8, p95: 9, p99: 10 },
          throughput: { average: 10000, total: 600000 },
          errors: 100, // 10% errors
          timeouts: 50, // 5% timeouts
        },
      ];

      const result = aggregateAllPhaseResults(phaseResults);

      // Success rate = (1000 - 100 - 50) / 1000 * 100 = 85%
      expect(parseFloat(result.successRate)).toBe(85);
    });

    it("should calculate weighted average latency based on request count", () => {
      const phaseResults = [
        {
          phaseName: "Small Phase",
          duration: 10,
          requests: { total: 100, average: 10, sent: 100 },
          latency: { min: 10, max: 100, mean: 50, p50: 40, p90: 80, p95: 90, p99: 95 },
          throughput: { average: 1000, total: 10000 },
          errors: 0,
          timeouts: 0,
        },
        {
          phaseName: "Large Phase",
          duration: 100,
          requests: { total: 900, average: 9, sent: 900 },
          latency: { min: 5, max: 50, mean: 20, p50: 15, p90: 40, p95: 45, p99: 48 },
          throughput: { average: 9000, total: 900000 },
          errors: 0,
          timeouts: 0,
        },
      ];

      const result = aggregateAllPhaseResults(phaseResults);

      // Weighted mean: (100*50 + 900*20) / 1000 = (5000 + 18000) / 1000 = 23
      expect(result.latency.mean).toBe(23);
    });
  });

  describe("RAMP_INTERVAL constant", () => {
    it("should be 5 seconds", () => {
      expect(RAMP_INTERVAL).toBe(5);
    });
  });
});
