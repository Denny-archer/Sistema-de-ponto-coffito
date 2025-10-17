import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listJustificativas,
  listJustificativasRange,
} from "../services/justificativas";
import {
  keyFromDate,
  parseApiDate,
  monthStart,
  monthEnd,
} from "../utils/dateUtils";

/**
 * Hook responsável por marcar os dias com justificativas no calendário.
 * - Se for colaborador → filtra pelo id_requerente (userId)
 * - Se for gestor → mostra todas
 */
export default function useJustificativasMarcadores({
  userId,
  userType, // ✅ novo parâmetro (1 = gestor)
  activeStartDate,
}) {
  const [keysSet, setKeysSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // ✅ Memoiza início e fim do mês
  const start = useMemo(() => monthStart(activeStartDate || new Date()), [activeStartDate]);
  const end = useMemo(() => monthEnd(activeStartDate || new Date()), [activeStartDate]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let lista = [];

      // 🔹 Ajuste de timezone — garante que o dia atual não seja excluído do range
      const startFixed = new Date(start);
      const endFixed = new Date(end);
      startFixed.setHours(0, 0, 0, 0);
      endFixed.setHours(23, 59, 59, 999);

      // 🔹 Se for gestor → lista todas
      const isGestor =
        userType === 1 ||
        String(userType).toLowerCase().includes("admin") ||
        String(userType).toLowerCase().includes("gestor");

      if (isGestor) {
        try {
          lista = await listJustificativasRange({
            start: keyFromDate(startFixed),
            end: keyFromDate(endFixed),
          });
        } catch (errRange) {
          console.warn("⚠️ Falha no listJustificativasRange (gestor), usando fallback:", errRange);
          const all = await listJustificativas();
          lista = all.filter((j) => {
            const d = parseApiDate(j.data_requerida || j.data || j.criado_em || j.created_at);
            return d && d >= startFixed && d <= endFixed;
          });
        }
      } else {
        // 🔹 Colaborador → filtra pelo id_requerente
        try {
          lista = await listJustificativasRange({
            userId,
            start: keyFromDate(startFixed),
            end: keyFromDate(endFixed),
          });
        } catch (errRange) {
          console.warn("⚠️ Falha no listJustificativasRange (colaborador), usando fallback:", errRange);
          const all = await listJustificativas({ userId });
          lista = all.filter((j) => {
            const d = parseApiDate(j.data_requerida || j.data || j.criado_em || j.created_at);
            return d && d >= startFixed && d <= endFixed;
          });
        }
      }

      // ✅ Gera set com as datas das justificativas
      const s = new Set();
      for (const j of lista) {
        const d = parseApiDate(j.data_requerida || j.data || j.criado_em || j.created_at);
        if (d && d >= startFixed && d <= endFixed) s.add(keyFromDate(d));
      }

      setKeysSet(s);
    } catch (err) {
      console.error("❌ Erro ao carregar marcadores de justificativas:", err);
      setKeysSet(new Set());
    } finally {
      setLoading(false);
    }
  }, [userId, userType, start, end]);

  // ✅ Recarrega apenas quando mês ou usuário mudam
  useEffect(() => {
    load();
  }, [load]);

  // Retorna true se a data tiver justificativa
  const hasJust = useCallback((date) => keysSet.has(keyFromDate(date)), [keysSet]);

  return useMemo(
    () => ({
      loading,
      hasJust, // (date) => boolean
      refresh: load, // recarrega (use após criar justificativa)
      keysSet, // conjunto de dias com justificativas
    }),
    [loading, hasJust, load, keysSet]
  );
}
