import React from "react";
import {
  User,
  Calendar,
  SortAsc,
} from "lucide-react";
import ColaboradorRow from "./ColaboradorRow";

export default function ColaboradoresTable({
  colaboradores,
  sortField,
  sortDirection,
  onSort,
  onExcluir,
  onEditar,
}) {
  const SortableHeader = ({ field, children }) => (
    <th
      onClick={() => onSort(field)}
      style={{ cursor: "pointer" }}
      className="user-select-none"
    >
      <div className="d-flex align-items-center gap-1">
        {children}
        {sortField === field && (
          <SortAsc
            size={12}
            className={sortDirection === "desc" ? "rotate-180" : ""}
          />
        )}
      </div>
    </th>
  );

  if (!colaboradores.length)
    return (
      <div className="text-center py-5 text-muted">
        Nenhum colaborador encontrado
      </div>
    );

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <SortableHeader field="nome">
              <User size={14} /> Nome
            </SortableHeader>
            <th>Departamento</th>
            <th>Cargo</th>
            <SortableHeader field="dataAdmissao">
              <Calendar size={14} /> Admissão
            </SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <th className="text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {colaboradores.map((c) => (
            <ColaboradorRow
              key={c.id}
              colab={c}
              onExcluir={onExcluir}
              onEditar={onEditar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
