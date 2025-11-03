import { http, setToken, clearToken, getToken } from "./http";

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
  try {
    const { data } = await http.get("/usuarios/me");
    return data;
  } catch (err) {
    console.error("Erro ao buscar usuário autenticado:", err.response?.data || err.message);
    return null;
  }
}

export async function logoutRequest() {
  clearToken();
}
