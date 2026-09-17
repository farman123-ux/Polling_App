import axios from 'axios';

// Determine base URL dynamically based on environment
const envUrl = import.meta.env.VITE_API_URL;
let baseURL = "/api";

if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
  let cleanUrl = envUrl.trim();
  // If loaded on HTTPS, upgrade http to https to prevent Mixed Content network errors
  if (typeof window !== "undefined" && window.location.protocol === "https:" && cleanUrl.startsWith("http:")) {
    cleanUrl = cleanUrl.replace(/^http:/, "https:");
  }
  if (cleanUrl.startsWith("http")) {
    cleanUrl = cleanUrl.replace(/\/+$/, "");
    baseURL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
}

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