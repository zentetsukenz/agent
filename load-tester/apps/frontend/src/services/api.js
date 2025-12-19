import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;

    // Handle validation errors with details
    if (responseData?.details && Array.isArray(responseData.details)) {
      const detailsMessage = responseData.details.join(', ');
      return Promise.reject(new Error(detailsMessage));
    }

    const message =
      responseData?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);
