import { http } from "./http";

export function listarBatidas() {
  return http.get("/batidas/");
}


export async function getBatidas(skip = 0) {
  try {
    const response = await http.get("/batidas/", { params: { skip } });
    return response.data.batidas || [];
  } catch (error) {
    console.error("Erro ao carregar batidas:", error.response?.data || error.message);
    throw error;
  }
}