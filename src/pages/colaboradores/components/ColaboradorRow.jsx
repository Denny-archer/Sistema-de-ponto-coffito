import React from "react";
import {
  User,
  Edit,
  Trash2,
  BadgeCheck,
  XCircle,
} from "lucide-react";

export default function ColaboradorRow({ colab, onExcluir, onEditar }) {
  const getStatusIcon = (status) =>
    status === "Ativo" ? (
      <BadgeCheck size={14} className="text-success" />
    ) : (
      <XCircle size={14} className="text-secondary" />
    );

  return (
    <tr className={colab.status === "Inativo" ? "opacity-75" : ""}>
      {/* Nome + Email */}
      <td>
        <div className="d-flex align-items-center">
          <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <div className="fw-semibold">{colab.nome}</div>
            <div className="text-muted small">{colab.email}</div>
          </div>
        </div>
      </td>

      {/* Departamento */}
      <td>
        <span className="badge bg-light text-dark">
          {colab.departamento || "-"}
        </span>
      </td>

      {/* Cargo */}
      <td>{colab.cargo || "-"}</td>

      {/* Data de Admissão */}
      <td>
        <small className="text-muted">{colab.dataAdmissao || "-"}</small>
      </td>
      
      {/* Status */}
      <td>
        <span
          className={`badge d-inline-flex align-items-center ${
            colab.status === "Ativo" ? "bg-success" : "bg-secondary"
          }`}
        >
          {getStatusIcon(colab.status)}
          <span className="ms-1">{colab.status || "Inativo"}</span>
        </span>
      </td>

      {/* Ações (apenas editar e excluir) */}
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button
            className="btn btn-outline-warning btn-sm"
            title="Editar colaborador"
            onClick={() => onEditar(colab)}
          >
            <Edit size={14} />
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            title="Excluir colaborador"
            onClick={() => onExcluir(colab.id, colab.nome)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
