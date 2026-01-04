import { api } from "./api";

export const endpointsAPI = {
  getAll: () => api.get("/endpoints"),
  getById: (id) => api.get(`/endpoints/${id}`),
  create: (data) => api.post("/endpoints", data),
  update: (id, data) => api.put(`/endpoints/${id}`, data),
  delete: (id) => api.delete(`/endpoints/${id}`),
};
