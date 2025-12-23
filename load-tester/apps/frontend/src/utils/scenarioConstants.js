/**
 * Scenario-related constants
 */

// Phase type options
export const PHASE_TYPES = [
  { value: 'ramp', label: 'Ramp', description: 'Gradually change connections' },
  { value: 'constant', label: 'Constant', description: 'Maintain steady connections' },
  { value: 'spike', label: 'Spike', description: 'Sudden burst of connections' },
];

// Default phase values
export const DEFAULT_PHASE = {
  name: '',
  duration: 60,
  connections: 10,
  type: 'constant',
};

// Phase type colors for UI
export const PHASE_TYPE_COLORS = {
  ramp: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  constant: {
    border: 'border-l-green-500',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  spike: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
};

// Scenario modes
export const SCENARIO_MODES = {
  simple: {
    value: 'simple',
    label: 'Simple',
    description: 'Test a single endpoint with your load pattern',
  },
  workflow: {
    value: 'workflow',
    label: 'Workflow',
    description: 'Execute setup, multi-step workflow, and teardown',
  },
};

// HTTP methods for workflow steps
export const HTTP_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

// Extractor sources
export const EXTRACTOR_SOURCES = [
  { value: 'body', label: 'Response Body', description: 'Extract from JSON body using JSONata path' },
  { value: 'header', label: 'Response Header', description: 'Extract from response header' },
  { value: 'cookie', label: 'Cookie', description: 'Extract from response cookie' },
];

// Default setup/teardown step
export const DEFAULT_SETUP_STEP = {
  name: '',
  method: 'POST',
  path: '',
  headers: {},
  body: '',
  extractors: [],
};

// Default workflow step
export const DEFAULT_WORKFLOW_STEP = {
  name: '',
  method: 'POST',
  path: '',
  headers: {},
  body: '',
  runOnce: false,
  extractors: [],
};

// Default extractor
export const DEFAULT_EXTRACTOR = {
  name: '',
  source: 'body',
  path: '',
};

// Error handling options
export const ERROR_HANDLING_OPTIONS = [
  { value: 'abort', label: 'Abort', description: 'Stop test immediately if step fails' },
  { value: 'retry', label: 'Retry', description: 'Retry failed steps up to configured limit' },
  { value: 'ignore', label: 'Ignore', description: 'Continue test even if step fails' },
];

// Method colors for UI
export const METHOD_COLORS = {
  GET: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  POST: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  PUT: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  PATCH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  DELETE: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};
