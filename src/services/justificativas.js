import { http } from "../services/http";

/**
 * Lista justificativas
 * - Colaborador → filtra por id_requerente (ID do usuário)
 * - Gestor → lista todas
 */
export async function listJustificativas({
  userId,
  status,
  skip = 0,
  limit = 9999,
} = {}) {
  const qs = new URLSearchParams();

  // 🔹 colaborador (usa id_requerente do backend)
  if (userId) qs.append("id_requerente", userId);

  // 🔹 gestor pode filtrar por status (pendente, aprovada, reprovada)
  if (status) qs.append("status", status);

  qs.append("skip", String(skip));
  qs.append("limit", String(limit));
  qs.append("sort", "false");

  const url = `/justificativas/?${qs.toString()}`;
  const resp = await http.get(url);

  return Array.isArray(resp.data?.justificativas)
    ? resp.data.justificativas
    : resp.data || [];
}

/** Criar justificativa */
export async function createJustificativa({ data_requerida, texto, anexo }) {
  const formData = new FormData();
  if (anexo) formData.append("anexo", anexo);

  const url = `/justificativas/?data_requerida=${encodeURIComponent(
    data_requerida
  )}&texto=${encodeURIComponent(texto)}`;

  return http.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** Lista justificativas com range de datas */
export async function listJustificativasRange({
  userId,
  start,
  end,
  skip = 0,
  limit = 9999,
}) {
  const qs = new URLSearchParams();

  if (userId) qs.append("id_requerente", userId); // ✅ usa o novo campo correto
  if (start) qs.append("data_ini", start);
  if (end) qs.append("data_fim", end);
  qs.append("skip", String(skip));
  qs.append("limit", String(limit));
  qs.append("sort", "false");

  const resp = await http.get(`/justificativas/?${qs.toString()}`);
  return Array.isArray(resp.data?.justificativas)
    ? resp.data.justificativas
    : resp.data || [];
}
