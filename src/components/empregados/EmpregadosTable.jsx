import React from "react";
import { Table, ButtonGroup, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CheckCircle2, Edit, FileDown } from "lucide-react";
import BatidaCell from "./BatidaCell";

/**
 * EmpregadosTable.jsx
 * Tabela otimizada com status visual e ações rápidas.
 */
export default function EmpregadosTable({ linhas, onOpenDay, onExportDia }) {
  if (!linhas?.length) {
    return <div className="text-center py-5 text-muted">Nenhum registro encontrado.</div>;
  }

  return (
    <Table hover responsive className="mb-0 align-middle">
      <thead className="bg-light">
        <tr>
          <th>Status</th>
          <th>Data</th>
          <th>Entrada</th>
          <th>Pausa</th>
          <th>Retorno</th>
          <th>Saída</th>
          <th>Jornada</th>
          <th>Status do Dia</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        {linhas.map((d) => {
          const isIncompleto = !d.saida || d.saida === "--:--";
          const statusBadge = isIncompleto ? (
            <span className="badge bg-warning text-dark">Incompleto</span>
          ) : (
            <span className="badge bg-success">Completo</span>
          );

          return (
            <tr key={d.diaISO}>
              {/* Status visual */}
              <td>
                <CheckCircle2
                  className={isIncompleto ? "text-warning" : "text-success"}
                  aria-label={isIncompleto ? "Incompleto" : "OK"}
                />
              </td>

              {/* Data */}
              <td>{d.label}</td>

              {/* Batidas */}
              <td>
                <BatidaCell
                  label="Entrada"
                  value={d.entrada || "--:--"}
                  onClick={() => onOpenDay(d)}
                />
              </td>
              <td>
                <BatidaCell
                  label="Pausa"
                  value={d.pausa || "--:--"}
                  onClick={() => onOpenDay(d)}
                />
              </td>
              <td>
                <BatidaCell
                  label="Retorno"
                  value={d.retorno || "--:--"}
                  onClick={() => onOpenDay(d)}
                />
              </td>
              <td>
                <BatidaCell
                  label="Saída"
                  value={d.saida || "--:--"}
                  onClick={() => onOpenDay(d)}
                />
              </td>

              {/* Jornada */}
              <td>{d.jornada || "--:--"}</td>

              {/* Novo status de dia */}
              <td>{statusBadge}</td>

              {/* Ações rápidas */}
              <td>
                <ButtonGroup size="sm">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Corrigir dia</Tooltip>}>
                    <Button variant="outline-secondary" onClick={() => onOpenDay(d)}>
                      <Edit size={14} />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Exportar dia</Tooltip>}>
                    <Button
                      variant="outline-info"
                      onClick={() => onExportDia?.(d)}
                      disabled={!onExportDia}
                    >
                      <FileDown size={14} />
                    </Button>
                  </OverlayTrigger>
                </ButtonGroup>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
