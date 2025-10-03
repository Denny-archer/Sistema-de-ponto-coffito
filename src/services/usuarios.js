// 📂 src/services/usuarios.js
import { http } from "./http";

// Criar novo usuário
export async function createUsuario(data) {
  try {
    const response = await http.post("/usuarios/", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error.response?.data || error.message);
    throw error;
  }
}

// Listar todos os usuários
export async function listarUsuarios(skip = 0, sort = false) {
  try {
    const response = await http.get(`/usuarios/?skip=${skip}&sort=${sort}`);
    return response.data.usuarios || [];
  } catch (error) {
    console.error("Erro ao listar usuários:", error.response?.data || error.message);
    throw error;
  }
}

// Buscar usuário por ID
export async function getUsuario(id) {
  try {
    const response = await http.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.response?.data || error.message);
    throw error;
  }
}

// Atualizar usuário
export async function updateUsuario(id, data) {
  try {
    const response = await http.put(`/usuarios/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
    throw error;
  }
}

// Deletar usuário
export async function deleteUsuario(id) {
  try {
    await http.delete(`/usuarios/${id}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar usuário:", error.response?.data || error.message);
    throw error;
  }
}

// Buscar batidas (pontos registrados)
export async function getBatidas() {
  try {
    const response = await http.get("/batidas/", { params: { skip: 0 } });
    return response.data.batidas || [];
  } catch (error) {
    console.error("Erro ao carregar batidas:", error.response?.data || error.message);
    throw error;
  }
}
