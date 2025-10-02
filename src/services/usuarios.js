// 📂 src/services/usuarios.js
import { http } from "./http";

export async function createUsuario(data) {
  try {
    const response = await http.post("/usuarios/", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error.response?.data || error.message);
    throw error;
  }
}



export async function listarUsuarios(skip = 0, sort = false) {
  try {
    const response = await http.get(`/usuarios/?skip=${skip}&sort=${sort}`);
    return response.data.usuarios;
  } catch (error) {
    console.error("Erro ao listar usuários:", error.response?.data || error.message);
    throw error;
  }
}

export async function getBatidas() {
  try {
    const response = await http.get("/batidas/", { params: { skip: 0 } });
    return response.data.batidas || [];
  } catch (error) {
    console.error("Erro ao carregar batidas:", error.response?.data || error.message);
    throw error;
  }
}