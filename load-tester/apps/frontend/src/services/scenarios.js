/**
 * Scenarios Service
 * API client for scenario operations
 */

import { api } from "./api";

// Real API implementation
const realAPI = {
  getAll: async () => {
    const response = await api.get("/scenarios");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/scenarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/scenarios", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/scenarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/scenarios/${id}`);
    return { success: true };
  },

  duplicate: async (id, name) => {
    // If no name provided, we need to fetch the original and generate one
    let duplicateName = name;
    if (!duplicateName) {
      const original = await api.get(`/scenarios/${id}`);
      duplicateName = `${original.data.name} (Copy)`;
    }
    const response = await api.post(`/scenarios/${id}/duplicate`, {
      name: duplicateName,
    });
    return response.data;
  },
};

export const scenariosAPI = realAPI;

// Helper functions for UI
export const getPhaseTypeLabel = (type) => {
  const labels = {
    ramp: "Ramp",
    constant: "Constant",
    spike: "Spike",
  };
  return labels[type] || type;
};

export const getTotalDuration = (phases) => {
  if (!phases || phases.length === 0) return 0;
  return phases.reduce((total, phase) => total + phase.duration, 0);
};

export const getMaxConnections = (phases) => {
  if (!phases || phases.length === 0) return 0;
  return Math.max(...phases.map((p) => p.connections));
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};
