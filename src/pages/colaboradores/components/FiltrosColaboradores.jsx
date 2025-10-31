import React from "react";
import { Search, Filter } from "lucide-react";

export default function FiltrosColaboradores({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterDepartamento,
  onDepartamentoChange,
  departamentos,
}) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small text-muted">Busca</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar por nome, e-mail..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted">Status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted">Departamento</label>
            <select
              className="form-select"
              value={filterDepartamento}
              onChange={(e) => onDepartamentoChange(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 text-end">
            <Filter size={20} className="text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
