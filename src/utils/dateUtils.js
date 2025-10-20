// Helpers de data estáveis
export const parseApiDate = (s) => {
  if (s instanceof Date) return s;
  const norm = String(s).replace(" ", "T");
  const d = new Date(norm);
  return isNaN(d) ? new Date(`${norm}:00`) : d;
};

export const keyFromDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // YYYY-MM-DD
};

export const formatPtBRDate = (d) =>
  (d instanceof Date ? d : new Date(d)).toLocaleDateString("pt-BR");

export const formatPtBRTime = (d) =>
  (d instanceof Date ? d : new Date(d)).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const monthEnd = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
