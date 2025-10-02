import { http } from "./http";

export async function listarCargos() {
  const response = await http.get("/cargos/");
  return response.data; // deve vir algo tipo [{id: 1, nome: "Analista"}, ...]
}
