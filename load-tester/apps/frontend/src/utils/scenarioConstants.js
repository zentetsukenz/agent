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
