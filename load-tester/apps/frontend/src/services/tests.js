import { api } from "./api";

export const testsAPI = {
  execute: (endpointId, config) =>
    api.post(`/api/endpoints/${endpointId}/test`, config),
  getResults: (id) => api.get(`/api/tests/${id}`),
  getStatus: (id) => api.get(`/api/tests/${id}/status`),
};
