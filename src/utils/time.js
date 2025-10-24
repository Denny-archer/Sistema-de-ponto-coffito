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
