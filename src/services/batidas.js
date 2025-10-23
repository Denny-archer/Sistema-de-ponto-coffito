// src/services/batidas.js
import { http } from "./http";

// 🔹 Lista todas as batidas (sem filtro)
export function listarBatidas() {
  return http.get("/batidas/");
}

// 🔹 Lista batidas paginadas (com skip)
export async function getBatidas(skip = 0) {
  try {
    const response = await http.get("/batidas/", { params: { skip } });
    return response.data.batidas || [];
  } catch (error) {
    console.error("Erro ao carregar batidas:", error.response?.data || error.message);
    throw error;
  }
}

// 🔹 Novo endpoint: saldo diário de um colaborador
export async function getSaldoDiario(id_usuario, data) {
  try {
    const response = await http.get(`/batidas/saldo_diario/${id_usuario}`, {
      params: { data }, // ex: 2025-10-23
    });
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao carregar saldo diário do usuário ${id_usuario}:`,
      error.response?.data || error.message
    );
    return null; // retorna null pra facilitar o tratamento no front
  }
}
