// src/services/batidas.js
import { http } from "./http";

// ================================
// 🔹 BATIDAS SERVICE
// ================================

// 🔸 Lista todas as batidas (sem filtro)
export async function listarBatidas() {
  try {
    const { data } = await http.get("/batidas/");
    return data.batidas || [];
  } catch (error) {
    console.error("Erro ao listar batidas:", error.response?.data || error.message);
    throw error;
  }
}

// 🔸 Lista batidas paginadas (mantido para compatibilidade)
export async function getBatidas(skip = 0) {
  try {
    const response = await http.get("/batidas/", { params: { skip } });
    return response.data.batidas || [];
  } catch (error) {
    console.error("Erro ao carregar batidas:", error.response?.data || error.message);
    throw error;
  }
}

// 🔸 Buscar batidas filtradas por colaborador e intervalo de data
export async function fetchBatidas({ idUsuario, dataInicio, dataFim }) {
  if (!idUsuario) throw new Error("ID do usuário é obrigatório.");
  try {
    const { data } = await http.get("/batidas/", {
      params: {
        id_usuario: idUsuario,
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
    return data.batidas || [];
  } catch (error) {
    console.error("Erro ao buscar batidas filtradas:", error.response?.data || error.message);
    throw error;
  }
}

// 🔸 Atualizar batida (usado pelo Drawer)
export async function updateBatida({ id, data_batida, descricao }) {
  if (!id || !data_batida) throw new Error("ID e data_batida são obrigatórios.");
  try {
    const { data } = await http.put(`/batidas/${id}`, {
      id,
      data_batida,
      descricao,
    });
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar batida ${id}:`, error.response?.data || error.message);
    throw error;
  }
}

// 🔸 Saldo diário de um colaborador (mantido do seu código original)
export async function getSaldoDiario(id_usuario, data) {
  try {
    const response = await http.get(`/batidas/saldo_diario/${id_usuario}`, {
      params: { data },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao carregar saldo diário do usuário ${id_usuario}:`,
      error.response?.data || error.message
    );
    return null;
  }
}

// ================================
// 🔹 USUÁRIOS SERVICE (necessário para tela de Empregados)
// ================================

export async function fetchUsuarios() {
  try {
    const { data } = await http.get("/usuarios/?skip=0&sort=false");
    return data.usuarios || [];
  } catch (error) {
    console.error("Erro ao carregar usuários:", error.response?.data || error.message);
    throw error;
  }
}

// ================================
// 🔹 AUDITORIA (placeholder até backend implementar)
// ================================

/**
 * Placeholder para logs/auditoria de correções
 * @param {object} params - { idUsuario, diaISO }
 * @returns {Promise<Array>} lista de logs [{ usuario, acao, motivo, data }]
 */
export async function fetchAuditoriaDia({ idUsuario, diaISO }) {
  console.warn("⚠️ fetchAuditoriaDia(): Endpoint ainda não implementado no backend.");
  // Quando o backend estiver pronto, trocar por:
  // const { data } = await http.get(`/batidas/auditoria`, { params: { id_usuario: idUsuario, dia: diaISO } });
  // return data.logs;
  return []; // retorno vazio temporário
}
