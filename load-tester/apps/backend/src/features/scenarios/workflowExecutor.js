/**
 * Workflow Executor
 * Executes scenario workflows with setup, load test, and teardown phases
 *
 * Workflow execution flow:
 * 1. Setup phase (once globally) - extract variables to shared context
 * 2. Load test phase - run phases with workflow steps per connection
 * 3. Teardown phase (once globally) - cleanup with shared context
 */

const axios = require("axios");
const logger = require("../../utils/logger");
const { interpolate, interpolateObject } = require("../../utils/interpolate");
const { applyExtractors } = require("../../utils/extractor");
const { ValidationError } = require("../../utils/errors");

// Default timeout for HTTP requests (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Error handling modes
const ERROR_HANDLING = {
  ABORT: "abort",
  RETRY: "retry",
  IGNORE: "ignore",
};

/**
 * Execute a single HTTP step
 *
 * @param {Object} step - Step configuration
 * @param {Object} context - Variable context for interpolation
 * @param {Object} options - Additional options
 * @param {number} options.timeout - Request timeout in ms
 * @param {Object} options.cookies - Cookies to include
 * @returns {Promise<Object>} - Response with extracted variables
 */
async function executeStep(step, context = {}, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, cookies = {} } = options;

  // Interpolate URL/path
  const url = interpolate(step.path, context);

  // Build headers with interpolation
  let headers = {};
  if (step.headers) {
    const stepHeaders = typeof step.headers === "string"
      ? JSON.parse(step.headers)
      : step.headers;
    headers = interpolateObject(stepHeaders, context);
  }

  // Add cookies to header if any
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
    headers.Cookie = cookieString;
  }

  // Build request body with interpolation
  let data;
  if (step.body) {
    const bodyStr = typeof step.body === "string" ? step.body : JSON.stringify(step.body);
    const interpolatedBody = interpolate(bodyStr, context);

    // Try to parse as JSON, otherwise use as string
    try {
      data = JSON.parse(interpolatedBody);
    } catch {
      data = interpolatedBody;
    }

    // Set content-type if not already set
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const requestConfig = {
    method: step.method.toUpperCase(),
    url,
    headers,
    timeout,
    validateStatus: () => true, // Don't throw on any status code
  };

  if (data) {
    requestConfig.data = data;
  }

  logger.debug("Executing step", {
    name: step.name,
    method: requestConfig.method,
    url: requestConfig.url,
  });

  const startTime = Date.now();
  const response = await axios(requestConfig);
  const duration = Date.now() - startTime;

  // Extract variables if extractors defined
  let extractedVars = {};
  if (step.extractors && step.extractors.length > 0) {
    extractedVars = await applyExtractors(
      {
        body: response.data,
        headers: response.headers,
        cookies: response.headers["set-cookie"],
      },
      step.extractors
    );
  }

  // Extract cookies from response for persistence
  const responseCookies = extractCookiesFromHeaders(response.headers);

  return {
    success: response.status >= 200 && response.status < 400,
    status: response.status,
    statusText: response.statusText,
    duration,
    extractedVars,
    cookies: responseCookies,
    body: response.data,
    headers: response.headers,
  };
}

/**
 * Extract cookies from Set-Cookie headers
 *
 * @param {Object} headers - Response headers
 * @returns {Object} - Cookies as key-value pairs
 */
function extractCookiesFromHeaders(headers) {
  const cookies = {};
  const setCookie = headers["set-cookie"];

  if (!setCookie) {
    return cookies;
  }

  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

  for (const cookieStr of cookieArray) {
    const [nameValue] = cookieStr.split(";");
    if (nameValue) {
      const [name, ...valueParts] = nameValue.split("=");
      cookies[name.trim()] = valueParts.join("=").trim();
    }
  }

  return cookies;
}

/**
 * Execute steps with error handling
 *
 * @param {Array} steps - Array of step configurations
 * @param {Object} context - Variable context
 * @param {Object} options - Execution options
 * @param {string} options.errorHandling - "abort" | "retry" | "ignore"
 * @param {number} options.retryCount - Number of retries
 * @param {string} options.phaseName - Name for logging
 * @returns {Promise<Object>} - Result with context and cookies
 */
async function executeStepsWithErrorHandling(steps, context, options = {}) {
  const {
    errorHandling = ERROR_HANDLING.ABORT,
    retryCount = 3,
    phaseName = "unknown",
    cookies: initialCookies = {},
  } = options;

  let currentContext = { ...context };
  let currentCookies = { ...initialCookies };
  const results = [];
  let hasErrors = false;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    let stepResult = null;
    let lastError = null;

    // Determine max attempts based on error handling mode
    const maxAttempts = errorHandling === ERROR_HANDLING.RETRY ? retryCount : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        stepResult = await executeStep(step, currentContext, {
          cookies: currentCookies,
        });

        if (!stepResult.success) {
          throw new Error(`Step failed with status ${stepResult.status}: ${stepResult.statusText}`);
        }

        // Merge extracted variables into context
        currentContext = { ...currentContext, ...stepResult.extractedVars };

        // Merge cookies for session persistence
        currentCookies = { ...currentCookies, ...stepResult.cookies };

        logger.info(`${phaseName} step completed`, {
          step: step.name,
          status: stepResult.status,
          duration: stepResult.duration,
          extractedVars: Object.keys(stepResult.extractedVars),
        });

        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        logger.warn(`${phaseName} step failed (attempt ${attempt}/${maxAttempts})`, {
          step: step.name,
          error: error.message,
        });

        if (attempt === maxAttempts) {
          // All retries exhausted
          switch (errorHandling) {
            case ERROR_HANDLING.ABORT:
              throw new Error(`${phaseName} step "${step.name}" failed: ${error.message}`);

            case ERROR_HANDLING.IGNORE:
              logger.warn(`Ignoring ${phaseName} step failure`, { step: step.name });
              hasErrors = true;
              stepResult = {
                success: false,
                error: error.message,
                extractedVars: {},
                cookies: {},
              };
              break;

            case ERROR_HANDLING.RETRY:
              // Already retried max times, treat like ignore
              logger.warn(`${phaseName} step failed after ${retryCount} retries`, { step: step.name });
              hasErrors = true;
              stepResult = {
                success: false,
                error: error.message,
                extractedVars: {},
                cookies: {},
              };
              break;
          }
        }
      }
    }

    results.push({
      step: step.name,
      ...stepResult,
    });
  }

  return {
    context: currentContext,
    cookies: currentCookies,
    results,
    hasErrors,
  };
}

/**
 * Execute setup phase
 * Runs once globally before load test, extracts variables to shared context
 *
 * @param {Array} setupSteps - Array of setup step configurations
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} - Shared context with extracted variables
 */
async function executeSetup(setupSteps, options = {}) {
  if (!setupSteps || setupSteps.length === 0) {
    return { context: {}, cookies: {}, results: [] };
  }

  logger.info("Starting setup phase", { stepCount: setupSteps.length });

  const result = await executeStepsWithErrorHandling(setupSteps, {}, {
    ...options,
    phaseName: "Setup",
  });

  logger.info("Setup phase completed", {
    extractedVars: Object.keys(result.context),
    hasErrors: result.hasErrors,
  });

  return result;
}

/**
 * Execute teardown phase
 * Runs once globally after load test for cleanup
 *
 * @param {Array} teardownSteps - Array of teardown step configurations
 * @param {Object} context - Shared context from setup and load test
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} - Teardown results
 */
async function executeTeardown(teardownSteps, context, options = {}) {
  if (!teardownSteps || teardownSteps.length === 0) {
    return { results: [] };
  }

  logger.info("Starting teardown phase", { stepCount: teardownSteps.length });

  const result = await executeStepsWithErrorHandling(teardownSteps, context, {
    ...options,
    phaseName: "Teardown",
  });

  logger.info("Teardown phase completed", {
    hasErrors: result.hasErrors,
  });

  return result;
}

/**
 * Build autocannon request handler for workflow steps
 * This returns a function that autocannon will call for each request
 *
 * @param {Array} workflowSteps - Array of workflow step configurations
 * @param {Object} sharedContext - Context from setup phase (shared across all connections)
 * @returns {Function} - Request handler for autocannon
 */
function buildWorkflowRequestHandler(workflowSteps, sharedContext = {}) {
  // Filter steps: runOnce steps run once per connection, others loop
  const setupSteps = workflowSteps.filter((s) => s.runOnce === true);
  const loadSteps = workflowSteps.filter((s) => s.runOnce !== true);

  // Per-connection state
  // Note: autocannon doesn't provide a way to maintain per-connection state easily
  // We'll use a simple approach: run setup steps on first request, then loop load steps
  const connectionState = new Map();

  return async (req) => {
    // Get or initialize connection state
    const connId = req.context?.connectionId || "default";
    let state = connectionState.get(connId);

    if (!state) {
      state = {
        initialized: false,
        context: { ...sharedContext },
        cookies: {},
        stepIndex: 0,
      };
      connectionState.set(connId, state);
    }

    try {
      // Run setup steps once per connection
      if (!state.initialized && setupSteps.length > 0) {
        for (const step of setupSteps) {
          const result = await executeStep(step, state.context, {
            cookies: state.cookies,
          });

          if (!result.success) {
            throw new Error(`Setup step "${step.name}" failed: ${result.status}`);
          }

          state.context = { ...state.context, ...result.extractedVars };
          state.cookies = { ...state.cookies, ...result.cookies };
        }
        state.initialized = true;
      }

      // Execute current load step
      if (loadSteps.length === 0) {
        // No load steps, just return success
        return { statusCode: 200 };
      }

      const step = loadSteps[state.stepIndex % loadSteps.length];
      const result = await executeStep(step, state.context, {
        cookies: state.cookies,
      });

      // Update state for next request
      state.context = { ...state.context, ...result.extractedVars };
      state.cookies = { ...state.cookies, ...result.cookies };
      state.stepIndex++;

      return {
        statusCode: result.status,
        duration: result.duration,
      };
    } catch (error) {
      logger.error("Workflow request error", { error: error.message });
      return {
        statusCode: 500,
        error: error.message,
      };
    }
  };
}

/**
 * Execute a workflow scenario
 * Orchestrates setup, load test with workflow, and teardown
 *
 * @param {Object} scenario - Scenario configuration
 * @param {Object} options - Execution options
 * @param {Function} phaseExecutor - Function to execute load test phases
 * @returns {Promise<Object>} - Combined results
 */
async function executeWorkflow(scenario, options = {}) {
  const {
    setup = [],
    workflow = [],
    teardown = [],
    setupErrorHandling = ERROR_HANDLING.ABORT,
    setupRetryCount = 3,
    teardownErrorHandling = ERROR_HANDLING.IGNORE,
    teardownRetryCount = 3,
  } = scenario;

  // Parse JSON if needed
  const setupSteps = typeof setup === "string" ? JSON.parse(setup) : setup;
  const workflowSteps = typeof workflow === "string" ? JSON.parse(workflow) : workflow;
  const teardownSteps = typeof teardown === "string" ? JSON.parse(teardown) : teardown;

  let setupResult = { context: {}, cookies: {} };
  let teardownResult = { results: [] };
  let setupError = null;
  let teardownError = null;

  // 1. Execute setup
  try {
    setupResult = await executeSetup(setupSteps, {
      errorHandling: setupErrorHandling,
      retryCount: setupRetryCount,
    });
  } catch (error) {
    setupError = error;
    logger.error("Setup phase failed", { error: error.message });

    if (setupErrorHandling === ERROR_HANDLING.ABORT) {
      return {
        status: "failed",
        error: `Setup failed: ${error.message}`,
        setupResults: [],
        teardownResults: [],
      };
    }
  }

  // 2. Build workflow handler for autocannon
  const workflowHandler = workflowSteps.length > 0
    ? buildWorkflowRequestHandler(workflowSteps, setupResult.context)
    : null;

  // 3. Execute teardown (always attempt, regardless of load test result)
  // Note: The caller should run teardown after load test completes
  const runTeardown = async () => {
    try {
      teardownResult = await executeTeardown(teardownSteps, setupResult.context, {
        errorHandling: teardownErrorHandling,
        retryCount: teardownRetryCount,
        cookies: setupResult.cookies,
      });
    } catch (error) {
      teardownError = error;
      logger.error("Teardown phase failed", { error: error.message });
    }

    return {
      results: teardownResult.results,
      error: teardownError?.message,
    };
  };

  return {
    status: setupError ? "setup_failed" : "ready",
    setupResults: setupResult.results || [],
    sharedContext: setupResult.context,
    cookies: setupResult.cookies,
    workflowHandler,
    runTeardown,
    hasWorkflow: workflowSteps.length > 0,
    setupError: setupError?.message,
  };
}

/**
 * Create request options for autocannon with workflow support
 *
 * @param {Object} endpoint - Endpoint configuration
 * @param {Object} sharedContext - Variables from setup phase
 * @param {Array} workflowSteps - Workflow steps configuration
 * @returns {Object} - Autocannon-compatible options
 */
function buildAutocannonOptions(endpoint, sharedContext = {}, workflowSteps = []) {
  // If no workflow steps, use simple endpoint-based request
  if (!workflowSteps || workflowSteps.length === 0) {
    const options = {
      url: endpoint.url,
      method: endpoint.method,
    };

    if (endpoint.headers) {
      try {
        options.headers = JSON.parse(endpoint.headers);
      } catch {
        // Ignore parse errors
      }
    }

    if (endpoint.body) {
      options.body = endpoint.body;
    }

    return options;
  }

  // With workflow, we need to build requests from workflow steps
  // Filter to get load steps (not runOnce)
  const loadSteps = workflowSteps.filter((s) => s.runOnce !== true);

  if (loadSteps.length === 0) {
    // All steps are runOnce (setup only), fall back to endpoint
    return {
      url: endpoint.url,
      method: endpoint.method,
    };
  }

  // Build requests array for autocannon
  // Each request is a step in the workflow
  const requests = loadSteps.map((step) => {
    const request = {
      method: step.method.toUpperCase(),
      path: interpolate(step.path, sharedContext),
    };

    // Add headers
    if (step.headers) {
      const headers = typeof step.headers === "string"
        ? JSON.parse(step.headers)
        : step.headers;
      request.headers = interpolateObject(headers, sharedContext);
    }

    // Add body
    if (step.body) {
      const bodyStr = typeof step.body === "string" ? step.body : JSON.stringify(step.body);
      const interpolatedBody = interpolate(bodyStr, sharedContext);

      try {
        request.body = JSON.stringify(JSON.parse(interpolatedBody));
      } catch {
        request.body = interpolatedBody;
      }

      // Ensure content-type header
      request.headers = request.headers || {};
      if (!request.headers["Content-Type"]) {
        request.headers["Content-Type"] = "application/json";
      }
    }

    return request;
  });

  // Extract base URL from first step's path
  // Autocannon needs a base URL and relative paths
  const firstStep = loadSteps[0];
  const firstPath = interpolate(firstStep.path, sharedContext);

  // Determine if paths are absolute URLs or relative
  const isAbsoluteUrl = firstPath.startsWith("http://") || firstPath.startsWith("https://");

  if (isAbsoluteUrl) {
    // Use full URLs directly
    return {
      url: firstPath,
      requests,
    };
  }

  // Relative paths - use endpoint URL as base
  return {
    url: endpoint.url,
    requests,
  };
}

module.exports = {
  // Main execution
  executeWorkflow,
  executeSetup,
  executeTeardown,
  executeStep,

  // Helpers
  buildWorkflowRequestHandler,
  buildAutocannonOptions,
  executeStepsWithErrorHandling,
  extractCookiesFromHeaders,

  // Constants
  ERROR_HANDLING,
  DEFAULT_TIMEOUT,
};
