// src/services/http.js
import axios from "axios";
import { API_BASE } from "../config";

const ACCESS_TOKEN_KEY = "access_token";

export function getToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token, persist = false) {
  if (persist) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http; // 🔹 Garante compatibilidade com imports default
