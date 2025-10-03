// 📂 src/services/departamentos.js
import { http } from "./http";

// GET departamentos
export async function listarDepartamentos({ skip = 0, sort = false } = {}) {
  const { data } = await http.get(`/departamentos/?skip=${skip}&sort=${sort}`);
  return data.departamentos || [];
}

// POST novo departamento
export async function createDepartamento(payload) {
  const { data } = await http.post("/departamentos/", payload);
  return data;
}

// PUT atualizar
export async function updateDepartamento(id, payload) {
  const { data } = await http.put(`/departamentos/${id}`, payload);
  return data;
}

// DELETE
export async function deleteDepartamento(id) {
  await http.delete(`/departamentos/${id}`);
  return true;
}
