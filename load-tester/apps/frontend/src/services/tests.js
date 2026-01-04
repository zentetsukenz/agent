import { api } from "./api";

export const testsAPI = {
  getAll: () => api.get("/tests"),
  execute: (endpointId, config) =>
    api.post(`/endpoints/${endpointId}/test`, config),
  executeWithScenario: (endpointId, scenarioId) =>
    api.post(`/endpoints/${endpointId}/test`, { scenarioId }),
  getResults: (id) => api.get(`/tests/${id}`),
  getStatus: (id) => api.get(`/tests/${id}/status`),
  cancelTest: (id) => api.delete(`/tests/${id}/cancel`),
};
