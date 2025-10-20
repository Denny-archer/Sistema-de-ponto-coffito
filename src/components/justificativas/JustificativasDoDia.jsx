import React, { useEffect, useMemo, useState } from "react";
import { listJustificativas } from "../../services/justificativas";
import {
  parseApiDate,
  keyFromDate,
  formatPtBRDate,
  formatPtBRTime,
} from "../../utils/dateUtils";
import useUser from "../../hooks/useUser";

/**
 * Props:
 * - userId: número (obrigatório para filtrar do colaborador)
 * - date: Date | string (dia selecionado)
 * - showList: boolean (default true)
 * - className: string
 *
 * Mostra justificativas do dia selecionado.
 * Se for gestor → mostra todas (pendentes/aprovadas/reprovadas)
 * Se for colaborador → mostra apenas as próprias.
 */
export default function JustificativasDoDia({
  userId,
  date,
  showList = true,
  className = "",
  refreshKey = 0,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const selectedKey = keyFromDate(date);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!date || !user) return;
      setLoading(true);

      try {
        let lista = [];

        // 🔹 Detecta se é gestor (tipo 1 ou string "Administrador"/"Gestor")
        const isGestor =
          user?.tipo_usuario === 1 ||
          String(user?.tipo_usuario).toLowerCase().includes("admin") ||
          String(user?.tipo_usuario).toLowerCase().includes("gestor");

        if (isGestor) {
          // ✅ Gestor: busca todas as justificativas
          const todas = await listJustificativas();

          // 🔹 Garante que também veja as próprias, sem duplicar
          const minhas = await listJustificativas({ userId });
          const combinadas = [
            ...todas,
            ...minhas.filter((m) => !todas.some((t) => t.id === m.id)),
          ];

          lista = combinadas;
        } else {
          // 🔹 Colaborador → apenas as próprias
          lista = await listJustificativas({ userId });
        }

        // ✅ Filtra justificativas do dia atual (por data_requerida ou criado_em)
        const filtered = lista.filter((j) => {
          const d = new Date(
            new Date(j.data_requerida || j.data || j.criado_em || j.created_at)
            .toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
          );

          return keyFromDate(d) === selectedKey;
        });

        if (mounted) setItems(filtered);
      } catch (e) {
        console.error("Erro ao carregar justificativas:", e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.tipo_usuario, userId, selectedKey, refreshKey]);

  const resumo = useMemo(() => {
    if (!items.length) return null;
    const prio = { reprovada: 3, rejeitada: 3, pendente: 2, aprovada: 1 };
    const norm = (s = "") => String(s).toLowerCase();
    const ordenadas = [...items].sort(
      (a, b) => (prio[norm(b.status)] || 0) - (prio[norm(a.status)] || 0)
    );
    return ordenadas[0]?.status ?? null;
  }, [items]);

  return (
    <div className={className}>
      {!loading && showList && items.length > 0 && (
        <div className="mt-3">
          <h6 className="fw-bold mb-2">Justificativas do dia</h6>
          <ul className="list-group">
            {items.map((j) => {
              const d = parseApiDate(
                j.data_requerida || j.data || j.criado_em || j.created_at
              );
              const status = String(j.status || "").toLowerCase();
              const chipClass = status.includes("aprov")
                ? "bg-success"
                : status.includes("reprov") || status.includes("rejeit")
                ? "bg-danger"
                : "bg-warning text-dark";

              return (
                <li
                  key={j.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="me-3">
                    <div className="fw-semibold">{j.texto || j.descricao || "—"}</div>
                    <small className="text-muted">
                      {formatPtBRDate(d)} {formatPtBRTime(d)}
                    </small>
                  </div>
                  <span className={`badge rounded-pill ${chipClass}`}>
                    {j.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!loading && showList && items.length === 0 && (
        <p className="text-muted small">Nenhuma justificativa registrada.</p>
      )}
    </div>
  );
}
