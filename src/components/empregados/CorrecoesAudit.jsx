// src/components/empregados/CorrecoesAudit.jsx
import React from "react";

export default function CorrecoesAudit({ logs = [] }) {
  if (!logs.length) {
    return <div className="text-muted small">Sem histórico para este dia.</div>;
  }
  return (
    <ul className="list-group">
      {logs.map((l, i) => (
        <li key={i} className="list-group-item d-flex justify-content-between">
          <div>
            <strong>{l.acao}</strong>
            <div className="small text-muted">{l.usuario ?? "Sistema"} — {l.motivo ?? "-"}</div>
          </div>
          <span className="small text-muted">
            {new Date(l.data).toLocaleString("pt-BR")}
          </span>
        </li>
      ))}
    </ul>
  );
}
