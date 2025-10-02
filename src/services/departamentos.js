import { http } from "./http";

export async function listarDepartamentos() {
  const response = await http.get("/departamentos/");
  return response.data; // deve vir algo tipo [{id: 1, nome: "TI"}, ...]
}
