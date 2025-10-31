// src/utils/time.js
// 🧭 Mantém suas funções originais
export function ymdFirstDay(year, month1Based) {
  const m = String(month1Based).padStart(2, "0");
  return `${year}-${m}-01`;
}

export function mmToHHmm(totalMin) {
  const sign = totalMin < 0 ? "-" : "";
  const abs = Math.abs(totalMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function HHmmToMin(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function monthLabelFromYYYYMMDD(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-"))
    return "—";
  const [year, month] = dateStr.split("-");
  return `${new Date(year, month - 1).toLocaleString("pt-BR", {
    month: "long",
  })} / ${year}`;
}

export function businessDaysInMonth(year, month1Based) {
  const d = new Date(year, month1Based - 1, 1);
  let count = 0;
  while (d.getMonth() === month1Based - 1) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ⚙️ --- ADICIONAR A PARTIR DAQUI (NOVAS FUNÇÕES) ---

// padding utilitário
export const pad2 = (n) => String(n).padStart(2, "0");

export function toBRDate(d) {
  if (!d) return "";
  const date =
    typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)
      ? new Date(d + "T12:00:00")
      : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function toBRTime(d) {
  if (!d) return "--:--";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function mergeISOAndTime(diaISO, hhmm) {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  const dt = new Date(diaISO + "T00:00:00");
  dt.setHours(h || 0, m || 0, 0, 0);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}:00`;
}

export function diffHHmm(start, end) {
  const a = new Date(start), b = new Date(end);
  if (Number.isNaN(a) || Number.isNaN(b)) return "00:00";
  const ms = Math.max(0, b - a);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${pad2(h)}:${pad2(m)}`;
}

export function normalizeDayKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d)) return null;
  const h = d.getHours();
  if (h < 5) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
