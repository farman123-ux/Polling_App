import axios from 'axios';

// Determine base URL dynamically based on environment
const envUrl = import.meta.env.VITE_API_URL;
const baseURL = envUrl && envUrl.startsWith("http") ? envUrl : "/api";

const api = axios.create({ baseURL });

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept responses to handle 401 Unauthorized errors (stale/invalid tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;