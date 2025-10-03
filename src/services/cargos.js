// 📂 src/services/cargos.js
import { http } from "./http";

// GET cargos
export async function listarCargos({ skip = 0, sort = false } = {}) {
  const { data } = await http.get(`/cargos/?skip=${skip}&sort=${sort}`);
  return data.cargos || []; // 🔑 garante que retorna o array
}

// POST novo cargo
export async function createCargo(payload) {
  const { data } = await http.post("/cargos/", payload);
  return data;
}

// PUT atualizar cargo
export async function updateCargo(id, payload) {
  const { data } = await http.put(`/cargos/${id}`, payload);
  return data;
}

// DELETE cargo
export async function deleteCargo(id) {
  await http.delete(`/cargos/${id}`);
  return true;
}
