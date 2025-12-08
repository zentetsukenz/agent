import { api } from "./api";

export const endpointsAPI = {
  getAll: () => api.get("/api/endpoints"),
  getById: (id) => api.get(`/api/endpoints/${id}`),
  create: (data) => api.post("/api/endpoints", data),
  update: (id, data) => api.put(`/api/endpoints/${id}`, data),
  delete: (id) => api.delete(`/api/endpoints/${id}`),
};
