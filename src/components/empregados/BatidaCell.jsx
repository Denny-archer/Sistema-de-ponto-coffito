// src/components/empregados/BatidaCell.jsx
import React from "react";
import { Edit } from "lucide-react";

export default function BatidaCell({ label, value, onClick }) {
  const isEmpty = !value || value === "--:--";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`d-flex align-items-center justify-content-between w-100 px-2 py-1 rounded border ${
        isEmpty ? "bg-light text-muted" : "bg-white"
      }`}
      aria-label={`Editar ${label}`}
      style={{ cursor: "pointer" }}
    >
      <span>{value || "--:--"}</span>
      <Edit size={14} className="text-primary" />
    </button>
  );
}
