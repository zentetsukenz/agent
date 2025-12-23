/**
 * Scenarios Service
 * API client for scenario operations
 * Currently uses mock data - will switch to real API in Phase 5
 */

// Toggle this when backend is ready
const USE_MOCK = true;

// Mock data for built-in templates
const mockTemplates = [
  {
    id: 1,
    name: 'Smoke Test',
    description: 'Minimal load to verify endpoint works correctly. Use this to ensure basic functionality before running heavier tests.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Smoke', duration: 60, connections: 2, type: 'constant' }
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Average Load Test',
    description: 'Simulate typical production traffic with gradual ramp-up and cooldown. Ideal for baseline performance measurements.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Ramp Up', duration: 30, connections: 50, type: 'ramp' },
      { name: 'Sustain', duration: 120, connections: 50, type: 'constant' },
      { name: 'Cool Down', duration: 30, connections: 0, type: 'ramp' }
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Stress Test',
    description: 'Progressive load increase to find system limits and breaking points. Helps identify maximum capacity.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Baseline', duration: 60, connections: 50, type: 'ramp' },
      { name: 'Stress 1', duration: 60, connections: 100, type: 'ramp' },
      { name: 'Stress 2', duration: 60, connections: 200, type: 'ramp' },
      { name: 'Stress 3', duration: 60, connections: 300, type: 'ramp' },
      { name: 'Recovery', duration: 60, connections: 0, type: 'ramp' }
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Spike Test',
    description: 'Sudden traffic spike to test system resilience and auto-scaling. Simulates flash sales or viral events.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Normal', duration: 30, connections: 20, type: 'constant' },
      { name: 'Spike Up', duration: 10, connections: 200, type: 'ramp' },
      { name: 'Spike Hold', duration: 30, connections: 200, type: 'constant' },
      { name: 'Spike Down', duration: 10, connections: 20, type: 'ramp' },
      { name: 'Recovery', duration: 30, connections: 20, type: 'constant' }
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    name: 'Soak Test',
    description: 'Extended duration test to detect memory leaks, connection issues, and performance degradation over time.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Ramp Up', duration: 60, connections: 30, type: 'ramp' },
      { name: 'Soak', duration: 1800, connections: 30, type: 'constant' },
      { name: 'Cool Down', duration: 60, connections: 0, type: 'ramp' }
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

// In-memory store for user-created scenarios (simulates database)
let mockUserScenarios = [];
let nextId = 100; // User scenarios start at ID 100

// Helper to get all scenarios
const getAllMockScenarios = () => [...mockTemplates, ...mockUserScenarios];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
const mockAPI = {
  getAll: async () => {
    await delay(300);
    return getAllMockScenarios();
  },

  getById: async (id) => {
    await delay(200);
    const scenario = getAllMockScenarios().find(s => s.id === parseInt(id));
    if (!scenario) {
      throw new Error('Scenario not found');
    }
    return scenario;
  },

  create: async (data) => {
    await delay(300);
    const newScenario = {
      ...data,
      id: nextId++,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUserScenarios.push(newScenario);
    return newScenario;
  },

  update: async (id, data) => {
    await delay(300);
    const scenario = getAllMockScenarios().find(s => s.id === parseInt(id));
    if (!scenario) {
      throw new Error('Scenario not found');
    }
    if (scenario.isTemplate) {
      throw new Error('Cannot edit built-in templates. Duplicate it first.');
    }
    const index = mockUserScenarios.findIndex(s => s.id === parseInt(id));
    if (index === -1) {
      throw new Error('Scenario not found');
    }
    mockUserScenarios[index] = {
      ...mockUserScenarios[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockUserScenarios[index];
  },

  delete: async (id) => {
    await delay(300);
    const scenario = getAllMockScenarios().find(s => s.id === parseInt(id));
    if (!scenario) {
      throw new Error('Scenario not found');
    }
    if (scenario.isTemplate) {
      throw new Error('Cannot delete built-in templates');
    }
    mockUserScenarios = mockUserScenarios.filter(s => s.id !== parseInt(id));
    return { success: true };
  },

  duplicate: async (id) => {
    await delay(300);
    const scenario = getAllMockScenarios().find(s => s.id === parseInt(id));
    if (!scenario) {
      throw new Error('Scenario not found');
    }
    const duplicated = {
      ...scenario,
      id: nextId++,
      name: `${scenario.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUserScenarios.push(duplicated);
    return duplicated;
  },
};

// Real API implementation (for Phase 5)
// import { api } from './api';
// const realAPI = {
//   getAll: () => api.get('/api/scenarios').then(res => res.data),
//   getById: (id) => api.get(`/api/scenarios/${id}`).then(res => res.data),
//   create: (data) => api.post('/api/scenarios', data).then(res => res.data),
//   update: (id, data) => api.put(`/api/scenarios/${id}`, data).then(res => res.data),
//   delete: (id) => api.delete(`/api/scenarios/${id}`),
//   duplicate: (id) => api.post(`/api/scenarios/${id}/duplicate`).then(res => res.data),
// };

export const scenariosAPI = USE_MOCK ? mockAPI : mockAPI; // Will switch to realAPI in Phase 5

// Helper functions for UI
export const getPhaseTypeLabel = (type) => {
  const labels = {
    ramp: 'Ramp',
    constant: 'Constant',
    spike: 'Spike',
  };
  return labels[type] || type;
};

export const getTotalDuration = (phases) => {
  return phases.reduce((total, phase) => total + phase.duration, 0);
};

export const getMaxConnections = (phases) => {
  return Math.max(...phases.map(p => p.connections));
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};
