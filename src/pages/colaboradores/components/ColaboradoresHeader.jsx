import React from "react";
import { Plus, RefreshCw } from "lucide-react";

export default function ColaboradoresHeader({ total, onAdd, onRefresh, loading }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
      <div className="mb-3 mb-md-0">
        <h2 className="fw-bold mb-1">Gestão de Colaboradores</h2>
        <p className="text-muted mb-0">
          {total} colaborador{total !== 1 ? "es" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-secondary d-flex align-items-center"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Atualizar
        </button>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={onAdd}
          disabled={loading}
        >
          <Plus size={18} className="me-2" />
          Adicionar Colaborador
        </button>
      </div>
    </div>
  );
}
