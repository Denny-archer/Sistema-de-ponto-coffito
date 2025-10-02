import { http } from "./http";

// Criar uma nova solicitação
export async function criarSolicitacao({ data, descricao, arquivo }) {
  const formData = new FormData();
  formData.append("data", data);       // data da batida não registrada
  formData.append("descricao", descricao);
  if (arquivo) {
    formData.append("anexo", arquivo); // opcional
  }

  const res = await http.post("/solicitacoes/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
