import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dona_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("dona_token")) {
      localStorage.removeItem("dona_token");
      localStorage.removeItem("dona_user");
      window.dispatchEvent(new Event("dona-session-expired"));
    }
    return Promise.reject(error);
  },
);
export const message = (err) =>
  err.response?.data?.message ||
  "No se pudo conectar. Comprueba que el backend esté encendido e intenta otra vez.";
