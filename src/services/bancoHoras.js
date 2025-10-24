import { http } from "./http";

// Busca saldo mensal do colaborador
export async function getSaldoMensal(idUsuario, year, month1Based) {
  const mes = `${year}-${String(month1Based).padStart(2, "0")}-01`;
  const { data } = await http.get(`/batidas/saldo_mensal/${idUsuario}`, {
    params: { mes },
  });
  return data;
}

// Cria batidas automáticas de compensação
export async function criarCompensacao({ id_usuario, dataISO, minutos }) {
  const descricao = `Compensação planejada de ${minutos} min`;
  const payload = {
    id_usuario,
    data_batida: dataISO.replace("T", " "), // formato aceito pelo backend
    descricao,
  };
  const { data } = await http.post("/batidas/", payload);
  return data;
}
