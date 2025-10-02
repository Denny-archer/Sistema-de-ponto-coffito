// 📂 src/services/auth.js
import { http, setToken, clearToken } from "./http";

export async function loginRequest({ email, password, remember }) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const { data } = await http.post("/token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  setToken(data.access_token, !!remember);
  return data;
}

export async function meRequest() {
  // seu backend ainda não tem /auth/me → pode usar /usuarios ou criar /me
  const { data } = await http.get("/usuarios?skip=0&sort=false");
  return data;
}

export async function logoutRequest() {
  clearToken();
}
