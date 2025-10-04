import { http, setToken, clearToken, getToken } from "./http";
import { jwtDecode } from "jwt-decode";  // ✅ corrigido

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
  const token = getToken();
  if (!token) return null;

  let decoded = null;
  try {
    decoded = jwtDecode(token); // ✅ agora funciona
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }

  const email = decoded?.sub || decoded?.email;
  if (!email) return null;

  try {
    const { data } = await http.get("/usuarios/?skip=0&sort=false");
    const usuario = data.usuarios.find((u) => u.email === email);

    return usuario || null;
  } catch (err) {
    console.error("Erro ao buscar usuário:", err.response?.data || err.message);
    return null;
  }
}

export async function logoutRequest() {
  clearToken();
}
