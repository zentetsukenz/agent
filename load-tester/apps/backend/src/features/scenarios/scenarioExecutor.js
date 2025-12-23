/**
 * Scenario Executor
 * Executes load test scenarios with multi-phase support
 *
 * Approach: Sequential phase execution using multiple autocannon instances
 * (autocannon doesn't support dynamic connection adjustment during a test)
 *
 * For workflow scenarios:
 * 1. Run setup steps (once globally)
 * 2. Run load test phases with workflow steps
 * 3. Run teardown steps (once globally)
 */

const autocannon = require("autocannon");
const logger = require("../../utils/logger");
const config = require("../../config");
const {
  ValidationError,
  NotFoundError,
  TimeoutError,
} = require("../../utils/errors");
const workflowExecutor = require("./workflowExecutor");
const { interpolate, interpolateObject } = require("../../utils/interpolate");

// In-memory store for running scenario tests
// Map: testId -> { phases: [], currentPhase: number, cancelled: boolean }
const runningScenarioTests = new Map();

// Ramp micro-phase interval in seconds
const RAMP_INTERVAL = 5;

/**
 * Calculate connection counts for ramp phases
 * Splits a ramp phase into micro-phases with gradually changing connections
 *
 * @param {number} startConnections - Starting connection count (from previous phase, or 0)
 * @param {number} endConnections - Target connection count at end of phase
 * @param {number} duration - Phase duration in seconds
 * @returns {Array<{connections: number, duration: number}>} - Array of micro-phases
 */
function calculateRampSteps(startConnections, endConnections, duration) {
  // If duration is less than interval, just do one step
  if (duration <= RAMP_INTERVAL) {
    return [{ connections: endConnections, duration }];
  }

  const steps = [];
  const numSteps = Math.ceil(duration / RAMP_INTERVAL);
  const actualStepDuration = duration / numSteps;
  const connectionDelta = (endConnections - startConnections) / numSteps;

  for (let i = 1; i <= numSteps; i++) {
    const connections = Math.round(startConnections + (connectionDelta * i));
    // Ensure at least 1 connection (autocannon requires it)
    steps.push({
      connections: Math.max(1, connections),
      duration: actualStepDuration,
    });
  }

  return steps;
}

/**
 * Expand phases into execution steps
 * Handles ramp phases by splitting them into micro-phases
 *
 * @param {Array} phases - Scenario phases from database
 * @returns {Array<{name: string, connections: number, duration: number, rps?: number, isPartOfRamp: boolean, parentPhaseName?: string}>}
 */
function expandPhasesToSteps(phases) {
  const steps = [];
  let previousConnections = 0;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];

    if (phase.type === "ramp") {
      // Split ramp into micro-steps
      const rampSteps = calculateRampSteps(
        previousConnections,
        phase.connections,
        phase.duration
      );

      rampSteps.forEach((step, stepIndex) => {
        steps.push({
          name: `${phase.name} (${stepIndex + 1}/${rampSteps.length})`,
          connections: step.connections,
          duration: step.duration,
          rps: phase.rps,
          isPartOfRamp: true,
          parentPhaseName: phase.name,
          phaseIndex: i,
        });
      });

      previousConnections = phase.connections;
    } else {
      // constant or spike - single step
      steps.push({
        name: phase.name,
        connections: Math.max(1, phase.connections), // Ensure at least 1
        duration: phase.duration,
        rps: phase.rps,
        isPartOfRamp: false,
        phaseIndex: i,
      });

      previousConnections = phase.connections;
    }
  }

  return steps;
}

/**
 * Run a single autocannon step
 *
 * @param {Object} options - Autocannon options
 * @param {number} testId - Test ID for cancellation tracking
 * @returns {Promise<Object>} - Raw autocannon results
 */
function runAutocannonStep(options, testId) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });

    // Track for potential cancellation
    const runningTest = runningScenarioTests.get(testId);
    if (runningTest) {
      runningTest.currentInstance = instance;
    }

    // Handle autocannon errors
    instance.on("error", (err) => {
      logger.error("Autocannon error in step", { error: err.message });
      reject(err);
    });
  });
}

/**
 * Format raw autocannon results into PhaseResult structure
 *
 * @param {Object} rawResults - Raw autocannon results
 * @param {string} phaseName - Name of the phase
 * @param {number} plannedDuration - Expected duration in seconds
 * @returns {Object} - Formatted PhaseResult
 */
function formatPhaseResult(rawResults, phaseName, plannedDuration) {
  const totalRequests = rawResults.requests?.total || 0;
  const errors = rawResults.errors || 0;
  const timeouts = rawResults.timeouts || 0;

  return {
    phaseName,
    duration: rawResults.duration || plannedDuration,
    requests: {
      total: totalRequests,
      average: rawResults.requests?.average || 0,
      sent: rawResults.requests?.sent || totalRequests,
    },
    latency: {
      min: rawResults.latency?.min || 0,
      max: rawResults.latency?.max || 0,
      mean: rawResults.latency?.mean || 0,
      p50: rawResults.latency?.p50 || 0,
      p90: rawResults.latency?.p90 || 0,
      p95: rawResults.latency?.p95 || 0,
      p99: rawResults.latency?.p99 || 0,
    },
    throughput: {
      average: rawResults.throughput?.average || 0,
      total: rawResults.throughput?.total || 0,
    },
    errors,
    timeouts,
  };
}

/**
 * Aggregate multiple step results into a single phase result
 * Used for ramp phases that are split into micro-steps
 *
 * @param {Array<Object>} stepResults - Array of formatted step results
 * @param {string} phaseName - Original phase name
 * @returns {Object} - Aggregated PhaseResult
 */
function aggregateStepResults(stepResults, phaseName) {
  if (stepResults.length === 0) {
    return formatPhaseResult({}, phaseName, 0);
  }

  if (stepResults.length === 1) {
    return { ...stepResults[0], phaseName };
  }

  // Calculate totals and weighted averages
  let totalDuration = 0;
  let totalRequests = 0;
  let totalSent = 0;
  let totalErrors = 0;
  let totalTimeouts = 0;
  let totalThroughput = 0;

  // For latency, we track weighted sums
  let latencyWeightedSum = {
    min: Infinity,
    max: 0,
    mean: 0,
    p50: 0,
    p90: 0,
    p95: 0,
    p99: 0,
  };

  stepResults.forEach((result) => {
    const duration = result.duration || 0;
    totalDuration += duration;
    totalRequests += result.requests?.total || 0;
    totalSent += result.requests?.sent || 0;
    totalErrors += result.errors || 0;
    totalTimeouts += result.timeouts || 0;
    totalThroughput += result.throughput?.total || 0;

    // Weighted average for latency using request count as weight
    const weight = result.requests?.total || 0;
    if (weight > 0) {
      latencyWeightedSum.min = Math.min(latencyWeightedSum.min, result.latency?.min || Infinity);
      latencyWeightedSum.max = Math.max(latencyWeightedSum.max, result.latency?.max || 0);
      latencyWeightedSum.mean += (result.latency?.mean || 0) * weight;
      latencyWeightedSum.p50 += (result.latency?.p50 || 0) * weight;
      latencyWeightedSum.p90 += (result.latency?.p90 || 0) * weight;
      latencyWeightedSum.p95 += (result.latency?.p95 || 0) * weight;
      latencyWeightedSum.p99 += (result.latency?.p99 || 0) * weight;
    }
  });

  // Calculate weighted averages
  const avgDivisor = totalRequests || 1;

  return {
    phaseName,
    duration: totalDuration,
    requests: {
      total: totalRequests,
      average: totalDuration > 0 ? totalRequests / totalDuration : 0,
      sent: totalSent,
    },
    latency: {
      min: latencyWeightedSum.min === Infinity ? 0 : latencyWeightedSum.min,
      max: latencyWeightedSum.max,
      mean: latencyWeightedSum.mean / avgDivisor,
      p50: latencyWeightedSum.p50 / avgDivisor,
      p90: latencyWeightedSum.p90 / avgDivisor,
      p95: latencyWeightedSum.p95 / avgDivisor,
      p99: latencyWeightedSum.p99 / avgDivisor,
    },
    throughput: {
      average: totalDuration > 0 ? totalThroughput / totalDuration : 0,
      total: totalThroughput,
    },
    errors: totalErrors,
    timeouts: totalTimeouts,
  };
}

/**
 * Aggregate all phase results into final combined results
 *
 * @param {Array<Object>} phaseResults - Array of PhaseResults
 * @returns {Object} - Combined results summary
 */
function aggregateAllPhaseResults(phaseResults) {
  if (phaseResults.length === 0) {
    return {
      requests: { total: 0, average: 0, sent: 0 },
      latency: { min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 },
      throughput: { average: 0, total: 0 },
      errors: 0,
      timeouts: 0,
      successRate: 0,
      duration: 0,
    };
  }

  // Aggregate using the same logic as step aggregation
  let totalDuration = 0;
  let totalRequests = 0;
  let totalSent = 0;
  let totalErrors = 0;
  let totalTimeouts = 0;
  let totalThroughput = 0;

  let latencyWeightedSum = {
    min: Infinity,
    max: 0,
    mean: 0,
    p50: 0,
    p90: 0,
    p95: 0,
    p99: 0,
  };

  phaseResults.forEach((result) => {
    const duration = result.duration || 0;
    totalDuration += duration;
    totalRequests += result.requests?.total || 0;
    totalSent += result.requests?.sent || 0;
    totalErrors += result.errors || 0;
    totalTimeouts += result.timeouts || 0;
    totalThroughput += result.throughput?.total || 0;

    const weight = result.requests?.total || 0;
    if (weight > 0) {
      latencyWeightedSum.min = Math.min(latencyWeightedSum.min, result.latency?.min || Infinity);
      latencyWeightedSum.max = Math.max(latencyWeightedSum.max, result.latency?.max || 0);
      latencyWeightedSum.mean += (result.latency?.mean || 0) * weight;
      latencyWeightedSum.p50 += (result.latency?.p50 || 0) * weight;
      latencyWeightedSum.p90 += (result.latency?.p90 || 0) * weight;
      latencyWeightedSum.p95 += (result.latency?.p95 || 0) * weight;
      latencyWeightedSum.p99 += (result.latency?.p99 || 0) * weight;
    }
  });

  const avgDivisor = totalRequests || 1;
  const successfulRequests = totalRequests - totalErrors - totalTimeouts;

  return {
    requests: {
      total: totalRequests,
      average: totalDuration > 0 ? totalRequests / totalDuration : 0,
      sent: totalSent,
    },
    latency: {
      min: latencyWeightedSum.min === Infinity ? 0 : latencyWeightedSum.min,
      max: latencyWeightedSum.max,
      mean: latencyWeightedSum.mean / avgDivisor,
      p50: latencyWeightedSum.p50 / avgDivisor,
      p90: latencyWeightedSum.p90 / avgDivisor,
      p95: latencyWeightedSum.p95 / avgDivisor,
      p99: latencyWeightedSum.p99 / avgDivisor,
    },
    throughput: {
      average: totalDuration > 0 ? totalThroughput / totalDuration : 0,
      total: totalThroughput,
    },
    errors: totalErrors,
    timeouts: totalTimeouts,
    successRate: totalRequests > 0
      ? ((successfulRequests / totalRequests) * 100).toFixed(2)
      : 0,
    duration: totalDuration,
  };
}

/**
 * Execute a workflow scenario (mode === "workflow")
 * Handles setup, load test with workflow steps, and teardown
 *
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @param {Object} scenario - Scenario object with setup, workflow, teardown, phases
 * @param {Object} endpoint - Endpoint to test (used as base URL for relative paths)
 * @returns {Promise<Object>} - Execution results
 */
async function executeWorkflowScenario(prisma, testId, scenario, endpoint) {
  const phaseResults = [];
  let workflowResult = null;

  try {
    logger.info("Starting workflow scenario execution", {
      testId,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      mode: scenario.mode,
    });

    // 1. Execute setup phase and get shared context
    workflowResult = await workflowExecutor.executeWorkflow(scenario, {});

    if (workflowResult.status === "setup_failed") {
      return {
        status: "failed",
        results: {
          error: workflowResult.setupError || "Setup phase failed",
          type: "setup_error",
          timestamp: new Date().toISOString(),
          setupResults: workflowResult.setupResults,
        },
        phaseResults: [],
      };
    }

    logger.info("Setup phase completed", {
      testId,
      extractedVars: Object.keys(workflowResult.sharedContext),
    });

    // 2. Execute load test phases with workflow steps
    // Parse phases and workflow
    const phases = typeof scenario.phases === "string"
      ? JSON.parse(scenario.phases)
      : scenario.phases;
    const workflowSteps = typeof scenario.workflow === "string"
      ? JSON.parse(scenario.workflow || "[]")
      : (scenario.workflow || []);

    // Expand phases into execution steps
    const steps = expandPhasesToSteps(phases);

    // Build base autocannon options with interpolated workflow
    const baseOptions = workflowExecutor.buildAutocannonOptions(
      endpoint,
      workflowResult.sharedContext,
      workflowSteps
    );

    // Execute each step sequentially
    const stepResults = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check for cancellation
      const runningTest = runningScenarioTests.get(testId);
      if (runningTest?.cancelled) {
        logger.info("Workflow scenario cancelled", { testId, currentStep: i });
        break;
      }

      // Update tracking
      if (runningTest) {
        runningTest.currentPhase = step.phaseIndex;
      }

      logger.info("Executing workflow step", {
        testId,
        step: i + 1,
        totalSteps: steps.length,
        name: step.name,
        connections: step.connections,
        duration: step.duration,
      });

      // Build step-specific options
      const stepOptions = {
        ...baseOptions,
        connections: step.connections,
        duration: step.duration,
      };

      if (step.rps) {
        stepOptions.overallRate = step.rps;
      }

      try {
        const rawResult = await runAutocannonStep(stepOptions, testId);
        const formattedResult = formatPhaseResult(rawResult, step.name, step.duration);
        stepResults.push({
          ...formattedResult,
          isPartOfRamp: step.isPartOfRamp,
          parentPhaseName: step.parentPhaseName,
          phaseIndex: step.phaseIndex,
        });
      } catch (stepError) {
        logger.error("Workflow step execution failed", {
          testId,
          step: step.name,
          error: stepError.message,
        });

        stepResults.push({
          phaseName: step.name,
          duration: 0,
          requests: { total: 0, average: 0, sent: 0 },
          latency: { min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 },
          throughput: { average: 0, total: 0 },
          errors: 1,
          timeouts: 0,
          error: stepError.message,
          isPartOfRamp: step.isPartOfRamp,
          parentPhaseName: step.parentPhaseName,
          phaseIndex: step.phaseIndex,
        });
      }
    }

    // Aggregate step results by original phase
    const originalPhases = typeof scenario.phases === "string"
      ? JSON.parse(scenario.phases)
      : scenario.phases;

    for (let i = 0; i < originalPhases.length; i++) {
      const phase = originalPhases[i];
      const phaseStepResults = stepResults.filter((r) => r.phaseIndex === i);

      if (phaseStepResults.length > 0) {
        const aggregatedPhase = aggregateStepResults(phaseStepResults, phase.name);
        phaseResults.push(aggregatedPhase);
      }
    }

    // 3. Execute teardown phase
    let teardownResult = null;
    if (workflowResult.runTeardown) {
      logger.info("Starting teardown phase", { testId });
      teardownResult = await workflowResult.runTeardown();
      logger.info("Teardown phase completed", {
        testId,
        hasErrors: !!teardownResult.error,
      });
    }

    // Aggregate all phases
    const aggregatedResults = aggregateAllPhaseResults(phaseResults);

    // Check if cancelled
    const finalState = runningScenarioTests.get(testId);
    const wasCancelled = finalState?.cancelled || false;

    // Clean up tracking
    runningScenarioTests.delete(testId);

    return {
      status: wasCancelled ? "cancelled" : "completed",
      results: {
        ...aggregatedResults,
        setupResults: workflowResult.setupResults,
        teardownResults: teardownResult?.results || [],
      },
      phaseResults,
    };
  } catch (error) {
    logger.error("Workflow scenario execution failed", {
      testId,
      scenarioId: scenario.id,
      error: error.message,
    });

    // Attempt teardown even on error
    if (workflowResult?.runTeardown) {
      try {
        await workflowResult.runTeardown();
      } catch (teardownError) {
        logger.error("Teardown after error also failed", {
          error: teardownError.message,
        });
      }
    }

    // Clean up tracking
    runningScenarioTests.delete(testId);

    return {
      status: "failed",
      results: {
        error: error.message,
        type: "error",
        timestamp: new Date().toISOString(),
      },
      phaseResults,
    };
  }
}

/**
 * Execute a scenario against an endpoint
 *
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @param {Object} scenario - Scenario object with phases
 * @param {Object} endpoint - Endpoint to test
 * @returns {Promise<void>}
 */
async function executeScenario(prisma, testId, scenario, endpoint) {
  // Check if this is a workflow scenario
  if (scenario.mode === "workflow") {
    return executeWorkflowScenario(prisma, testId, scenario, endpoint);
  }

  // Simple mode execution (existing logic)
  // Initialize tracking
  runningScenarioTests.set(testId, {
    phases: scenario.phases,
    currentPhase: 0,
    cancelled: false,
    currentInstance: null,
    startTime: new Date(),
  });

  const phaseResults = [];

  try {
    // Parse phases from JSON if needed
    const phases = typeof scenario.phases === "string"
      ? JSON.parse(scenario.phases)
      : scenario.phases;

    // Expand phases into execution steps
    const steps = expandPhasesToSteps(phases);

    logger.info("Starting scenario execution", {
      testId,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      totalSteps: steps.length,
      phases: phases.map(p => p.name),
    });

    // Build base autocannon options
    const baseOptions = {
      url: endpoint.url,
      method: endpoint.method,
    };

    // Add headers if provided
    if (endpoint.headers) {
      try {
        baseOptions.headers = JSON.parse(endpoint.headers);
      } catch (e) {
        logger.warn("Error parsing endpoint headers", { error: e.message });
      }
    }

    // Add body if provided
    if (endpoint.body) {
      baseOptions.body = endpoint.body;
    }

    // Group steps by original phase for aggregation
    const stepsByPhase = new Map();
    steps.forEach((step, index) => {
      const phaseKey = step.isPartOfRamp ? step.parentPhaseName : step.name;
      if (!stepsByPhase.has(phaseKey)) {
        stepsByPhase.set(phaseKey, []);
      }
      stepsByPhase.get(phaseKey).push({ ...step, stepIndex: index });
    });

    // Execute each step sequentially
    const stepResults = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check for cancellation
      const runningTest = runningScenarioTests.get(testId);
      if (runningTest?.cancelled) {
        logger.info("Scenario cancelled", { testId, currentStep: i });
        break;
      }

      // Update tracking
      if (runningTest) {
        runningTest.currentPhase = step.phaseIndex;
      }

      logger.info("Executing step", {
        testId,
        step: i + 1,
        totalSteps: steps.length,
        name: step.name,
        connections: step.connections,
        duration: step.duration,
      });

      // Build step-specific options
      const stepOptions = {
        ...baseOptions,
        connections: step.connections,
        duration: step.duration,
      };

      // Add RPS if specified
      if (step.rps) {
        stepOptions.overallRate = step.rps;
      }

      try {
        // Run autocannon for this step
        const rawResult = await runAutocannonStep(stepOptions, testId);

        // Format result
        const formattedResult = formatPhaseResult(rawResult, step.name, step.duration);
        stepResults.push({
          ...formattedResult,
          isPartOfRamp: step.isPartOfRamp,
          parentPhaseName: step.parentPhaseName,
          phaseIndex: step.phaseIndex,
        });
      } catch (stepError) {
        logger.error("Step execution failed", {
          testId,
          step: step.name,
          error: stepError.message,
        });

        // Add error result for this step
        stepResults.push({
          phaseName: step.name,
          duration: 0,
          requests: { total: 0, average: 0, sent: 0 },
          latency: { min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 },
          throughput: { average: 0, total: 0 },
          errors: 1,
          timeouts: 0,
          error: stepError.message,
          isPartOfRamp: step.isPartOfRamp,
          parentPhaseName: step.parentPhaseName,
          phaseIndex: step.phaseIndex,
        });
      }
    }

    // Aggregate step results by original phase
    const originalPhases = typeof scenario.phases === "string"
      ? JSON.parse(scenario.phases)
      : scenario.phases;

    for (let i = 0; i < originalPhases.length; i++) {
      const phase = originalPhases[i];
      const phaseStepResults = stepResults.filter(r => r.phaseIndex === i);

      if (phaseStepResults.length > 0) {
        const aggregatedPhase = aggregateStepResults(phaseStepResults, phase.name);
        phaseResults.push(aggregatedPhase);
      }
    }

    // Aggregate all phases into final results
    const aggregatedResults = aggregateAllPhaseResults(phaseResults);

    // Check if cancelled
    const finalState = runningScenarioTests.get(testId);
    const wasCancelled = finalState?.cancelled || false;

    // Clean up tracking
    runningScenarioTests.delete(testId);

    // Return results for the caller to save
    return {
      status: wasCancelled ? "cancelled" : "completed",
      results: aggregatedResults,
      phaseResults,
    };

  } catch (error) {
    logger.error("Scenario execution failed", {
      testId,
      scenarioId: scenario.id,
      error: error.message,
    });

    // Clean up tracking
    runningScenarioTests.delete(testId);

    return {
      status: "failed",
      results: {
        error: error.message,
        type: "error",
        timestamp: new Date().toISOString(),
      },
      phaseResults,
    };
  }
}

/**
 * Cancel a running scenario test
 *
 * @param {number} testId - Test ID
 * @returns {boolean} - True if test was running and is now marked for cancellation
 */
function cancelScenarioTest(testId) {
  const runningTest = runningScenarioTests.get(testId);

  if (!runningTest) {
    return false;
  }

  // Mark as cancelled
  runningTest.cancelled = true;

  // Stop current autocannon instance if running
  if (runningTest.currentInstance && typeof runningTest.currentInstance.stop === "function") {
    runningTest.currentInstance.stop();
  }

  return true;
}

/**
 * Check if a scenario test is running
 *
 * @param {number} testId - Test ID
 * @returns {boolean}
 */
function isScenarioTestRunning(testId) {
  return runningScenarioTests.has(testId);
}

/**
 * Get status of a running scenario test
 *
 * @param {number} testId - Test ID
 * @returns {Object|null} - Status object or null if not running
 */
function getScenarioTestStatus(testId) {
  const runningTest = runningScenarioTests.get(testId);

  if (!runningTest) {
    return null;
  }

  return {
    currentPhase: runningTest.currentPhase,
    totalPhases: runningTest.phases?.length || 0,
    cancelled: runningTest.cancelled,
    startTime: runningTest.startTime,
  };
}

module.exports = {
  // Main execution
  executeScenario,
  executeWorkflowScenario,
  cancelScenarioTest,
  isScenarioTestRunning,
  getScenarioTestStatus,

  // Exported for testing
  calculateRampSteps,
  expandPhasesToSteps,
  formatPhaseResult,
  aggregateStepResults,
  aggregateAllPhaseResults,
  RAMP_INTERVAL,
};
