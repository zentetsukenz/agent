/**
 * Scenarios Service
 * Business logic for scenario management
 */

const validator = require("validator");
const { ValidationError, NotFoundError } = require("../../utils/errors");

// Valid values for enums
const VALID_MODES = ["simple", "workflow"];
const VALID_PHASE_TYPES = ["ramp", "constant", "spike"];
const VALID_ERROR_HANDLING = ["abort", "retry", "ignore"];
const VALID_HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const VALID_EXTRACTOR_SOURCES = ["body", "header", "cookie"];

/**
 * Sanitize text input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== "string") return input;
  return validator.escape(input).trim();
}

/**
 * Validate phase data
 * @param {Object} phase - Phase object
 * @param {number} index - Phase index for error messages
 * @returns {string[]} - Array of error messages
 */
function validatePhase(phase, index) {
  const errors = [];
  const prefix = `Phase ${index + 1}`;

  if (!phase.name || typeof phase.name !== "string" || phase.name.trim() === "") {
    errors.push(`${prefix}: name is required`);
  }

  if (typeof phase.duration !== "number" || phase.duration < 1) {
    errors.push(`${prefix}: duration must be a positive number`);
  }

  if (typeof phase.connections !== "number" || phase.connections < 0) {
    errors.push(`${prefix}: connections must be a non-negative number`);
  }

  if (!phase.type || !VALID_PHASE_TYPES.includes(phase.type)) {
    errors.push(`${prefix}: type must be one of: ${VALID_PHASE_TYPES.join(", ")}`);
  }

  if (phase.rps !== undefined && (typeof phase.rps !== "number" || phase.rps < 0)) {
    errors.push(`${prefix}: rps must be a non-negative number`);
  }

  return errors;
}

/**
 * Validate setup/teardown/workflow step
 * @param {Object} step - Step object
 * @param {number} index - Step index
 * @param {string} stepType - "setup", "teardown", or "workflow"
 * @returns {string[]} - Array of error messages
 */
function validateStep(step, index, stepType) {
  const errors = [];
  const prefix = `${stepType} step ${index + 1}`;

  if (!step.name || typeof step.name !== "string" || step.name.trim() === "") {
    errors.push(`${prefix}: name is required`);
  }

  if (!step.method || !VALID_HTTP_METHODS.includes(step.method)) {
    errors.push(`${prefix}: method must be one of: ${VALID_HTTP_METHODS.join(", ")}`);
  }

  if (!step.path || typeof step.path !== "string" || step.path.trim() === "") {
    errors.push(`${prefix}: path is required`);
  }

  // Validate extractors if present
  if (step.extractors && Array.isArray(step.extractors)) {
    step.extractors.forEach((extractor, extIndex) => {
      if (!extractor.name || typeof extractor.name !== "string") {
        errors.push(`${prefix}, extractor ${extIndex + 1}: name is required`);
      }
      if (!extractor.source || !VALID_EXTRACTOR_SOURCES.includes(extractor.source)) {
        errors.push(`${prefix}, extractor ${extIndex + 1}: source must be one of: ${VALID_EXTRACTOR_SOURCES.join(", ")}`);
      }
    });
  }

  // Workflow-specific validation
  if (stepType === "workflow" && step.runOnce !== undefined && typeof step.runOnce !== "boolean") {
    errors.push(`${prefix}: runOnce must be a boolean`);
  }

  return errors;
}

/**
 * Validate scenario data
 * @param {Object} data - Scenario data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateScenarioData(data, isUpdate = false) {
  const errors = [];

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      errors.push("Name is required");
    } else if (data.name.trim().length > 255) {
      errors.push("Name must be at most 255 characters");
    }
  }

  // Description validation (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length > 1000) {
      errors.push("Description must be at most 1000 characters");
    }
  }

  // Mode validation
  if (data.mode !== undefined && !VALID_MODES.includes(data.mode)) {
    errors.push(`Mode must be one of: ${VALID_MODES.join(", ")}`);
  }

  // Phases validation (required)
  if (!isUpdate || data.phases !== undefined) {
    if (!data.phases || !Array.isArray(data.phases) || data.phases.length === 0) {
      errors.push("At least one phase is required");
    } else {
      data.phases.forEach((phase, index) => {
        errors.push(...validatePhase(phase, index));
      });
    }
  }

  // Setup steps validation (optional)
  if (data.setup !== undefined && data.setup !== null) {
    if (!Array.isArray(data.setup)) {
      errors.push("Setup must be an array");
    } else {
      data.setup.forEach((step, index) => {
        errors.push(...validateStep(step, index, "setup"));
      });
    }
  }

  // Workflow steps validation (optional)
  if (data.workflow !== undefined && data.workflow !== null) {
    if (!Array.isArray(data.workflow)) {
      errors.push("Workflow must be an array");
    } else {
      data.workflow.forEach((step, index) => {
        errors.push(...validateStep(step, index, "workflow"));
      });
    }
  }

  // Teardown steps validation (optional)
  if (data.teardown !== undefined && data.teardown !== null) {
    if (!Array.isArray(data.teardown)) {
      errors.push("Teardown must be an array");
    } else {
      data.teardown.forEach((step, index) => {
        errors.push(...validateStep(step, index, "teardown"));
      });
    }
  }

  // Error handling validation
  if (data.setupErrorHandling !== undefined && !VALID_ERROR_HANDLING.includes(data.setupErrorHandling)) {
    errors.push(`setupErrorHandling must be one of: ${VALID_ERROR_HANDLING.join(", ")}`);
  }

  if (data.teardownErrorHandling !== undefined && !VALID_ERROR_HANDLING.includes(data.teardownErrorHandling)) {
    errors.push(`teardownErrorHandling must be one of: ${VALID_ERROR_HANDLING.join(", ")}`);
  }

  if (data.setupRetryCount !== undefined && (typeof data.setupRetryCount !== "number" || data.setupRetryCount < 0)) {
    errors.push("setupRetryCount must be a non-negative number");
  }

  if (data.teardownRetryCount !== undefined && (typeof data.teardownRetryCount !== "number" || data.teardownRetryCount < 0)) {
    errors.push("teardownRetryCount must be a non-negative number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get all scenarios
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Array>} - List of scenarios
 */
async function getAllScenarios(prisma) {
  const scenarios = await prisma.scenario.findMany({
    orderBy: [
      { isTemplate: "desc" }, // Templates first
      { createdAt: "desc" },
    ],
  });

  // Parse JSON fields
  return scenarios.map(parseScenarioJson);
}

/**
 * Get scenario by ID
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Scenario ID
 * @returns {Promise<Object>} - Scenario
 */
async function getScenarioById(prisma, id) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: parseInt(id) },
    include: {
      endpoint: true,
      tests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!scenario) {
    throw new NotFoundError("Scenario");
  }

  return parseScenarioJson(scenario);
}

/**
 * Create new scenario
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {Object} data - Scenario data
 * @returns {Promise<Object>} - Created scenario
 */
async function createScenario(prisma, data) {
  const scenario = await prisma.scenario.create({
    data: {
      name: sanitizeInput(data.name),
      description: data.description ? sanitizeInput(data.description) : null,
      mode: data.mode || "simple",
      endpointId: data.endpointId ? parseInt(data.endpointId) : null,
      setup: data.setup ? JSON.stringify(data.setup) : null,
      workflow: data.workflow ? JSON.stringify(data.workflow) : null,
      teardown: data.teardown ? JSON.stringify(data.teardown) : null,
      phases: JSON.stringify(data.phases),
      setupErrorHandling: data.setupErrorHandling || "abort",
      setupRetryCount: data.setupRetryCount ?? 3,
      teardownErrorHandling: data.teardownErrorHandling || "ignore",
      teardownRetryCount: data.teardownRetryCount ?? 3,
      isTemplate: data.isTemplate || false,
    },
  });

  return parseScenarioJson(scenario);
}

/**
 * Update scenario
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Scenario ID
 * @param {Object} data - Updated scenario data
 * @returns {Promise<Object>} - Updated scenario
 */
async function updateScenario(prisma, id, data) {
  // Check if scenario exists and is not a template
  const existing = await prisma.scenario.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) {
    throw new NotFoundError("Scenario");
  }

  if (existing.isTemplate) {
    throw new ValidationError("Cannot edit built-in templates. Duplicate it first.");
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = sanitizeInput(data.name);
  }
  if (data.description !== undefined) {
    updateData.description = data.description ? sanitizeInput(data.description) : null;
  }
  if (data.mode !== undefined) {
    updateData.mode = data.mode;
  }
  if (data.endpointId !== undefined) {
    updateData.endpointId = data.endpointId ? parseInt(data.endpointId) : null;
  }
  if (data.setup !== undefined) {
    updateData.setup = data.setup ? JSON.stringify(data.setup) : null;
  }
  if (data.workflow !== undefined) {
    updateData.workflow = data.workflow ? JSON.stringify(data.workflow) : null;
  }
  if (data.teardown !== undefined) {
    updateData.teardown = data.teardown ? JSON.stringify(data.teardown) : null;
  }
  if (data.phases !== undefined) {
    updateData.phases = JSON.stringify(data.phases);
  }
  if (data.setupErrorHandling !== undefined) {
    updateData.setupErrorHandling = data.setupErrorHandling;
  }
  if (data.setupRetryCount !== undefined) {
    updateData.setupRetryCount = data.setupRetryCount;
  }
  if (data.teardownErrorHandling !== undefined) {
    updateData.teardownErrorHandling = data.teardownErrorHandling;
  }
  if (data.teardownRetryCount !== undefined) {
    updateData.teardownRetryCount = data.teardownRetryCount;
  }

  const scenario = await prisma.scenario.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return parseScenarioJson(scenario);
}

/**
 * Delete scenario
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Scenario ID
 * @returns {Promise<Object>} - Deleted scenario
 */
async function deleteScenario(prisma, id) {
  const existing = await prisma.scenario.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) {
    throw new NotFoundError("Scenario");
  }

  if (existing.isTemplate) {
    throw new ValidationError("Cannot delete built-in templates");
  }

  const scenario = await prisma.scenario.delete({
    where: { id: parseInt(id) },
  });

  return parseScenarioJson(scenario);
}

/**
 * Duplicate scenario (useful for creating from templates)
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} id - Source scenario ID
 * @param {string} newName - Name for the duplicated scenario
 * @returns {Promise<Object>} - Duplicated scenario
 */
async function duplicateScenario(prisma, id, newName) {
  const source = await prisma.scenario.findUnique({
    where: { id: parseInt(id) },
  });

  if (!source) {
    throw new NotFoundError("Scenario");
  }

  const scenario = await prisma.scenario.create({
    data: {
      name: sanitizeInput(newName),
      description: source.description,
      mode: source.mode,
      endpointId: source.endpointId,
      setup: source.setup,
      workflow: source.workflow,
      teardown: source.teardown,
      phases: source.phases,
      setupErrorHandling: source.setupErrorHandling,
      setupRetryCount: source.setupRetryCount,
      teardownErrorHandling: source.teardownErrorHandling,
      teardownRetryCount: source.teardownRetryCount,
      isTemplate: false, // Duplicates are never templates
    },
  });

  return parseScenarioJson(scenario);
}

/**
 * Parse JSON fields in scenario
 * @param {Object} scenario - Scenario from database
 * @returns {Object} - Scenario with parsed JSON fields
 */
function parseScenarioJson(scenario) {
  if (!scenario) return scenario;

  return {
    ...scenario,
    phases: scenario.phases ? JSON.parse(scenario.phases) : [],
    setup: scenario.setup ? JSON.parse(scenario.setup) : null,
    workflow: scenario.workflow ? JSON.parse(scenario.workflow) : null,
    teardown: scenario.teardown ? JSON.parse(scenario.teardown) : null,
  };
}

module.exports = {
  sanitizeInput,
  validatePhase,
  validateStep,
  validateScenarioData,
  getAllScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  parseScenarioJson,
  VALID_MODES,
  VALID_PHASE_TYPES,
  VALID_ERROR_HANDLING,
  VALID_HTTP_METHODS,
  VALID_EXTRACTOR_SOURCES,
};
