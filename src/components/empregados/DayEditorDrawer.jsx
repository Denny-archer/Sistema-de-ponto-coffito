// src/components/empregados/DayEditorDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Offcanvas, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { Clock, Save } from "lucide-react";
import { mergeISOAndTime, toBRDate, toBRTime, diffHHmm } from "../../utils/time";
import CorrecoesAudit from "./CorrecoesAudit";
import { updateBatida, fetchAuditoriaDia } from "../../services/batidas";

export default function DayEditorDrawer({
  show,
  onHide,
  day,          // { diaISO, label, batidas: [{id, data_batida, descricao}], grupoOrdenado: [...]} 
  onSave,       // callback para recarregar
}) {
  const [localBatidas, setLocalBatidas] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const title = day?.label ?? toBRDate(day?.diaISO) ?? "Dia";
  
  useEffect(() => {
    if (show) {
      // cópia editável
      const ordenadas = (day?.grupoOrdenado ?? []).map(b => ({
        ...b,
        horaStr: toBRTime(b.data_batida) // "HH:mm"
      }));
      setLocalBatidas(ordenadas);
      setMotivo("");
      // auditoria (se houver endpoint real, preencha)
      (async () => {
        const rows = await fetchAuditoriaDia({ idUsuario: day?.idUsuario, diaISO: day?.diaISO });
        setLogs(rows);
      })();
    }
  }, [show, day]);

  const jornada = useMemo(() => {
    if (!localBatidas.length) return "00:00";
    const first = localBatidas[0]?.data_batida;
    const last  = localBatidas[localBatidas.length - 1]?.data_batida;
    return first && last ? diffHHmm(first, last) : "00:00";
  }, [localBatidas]);

  async function salvar() {
    if (!day?.diaISO || !localBatidas.length) return;
    if (!motivo.trim()) {
      alert("Informe o motivo da correção.");
      return;
    }
    setLoading(true);
    try {
      // salva todas as batidas alteradas (comparando hora)
      for (const b of localBatidas) {
        const hh = (b.horaStr || "").slice(0,5); // HH:mm
        const novoDateTime = mergeISOAndTime(day.diaISO, hh);
        // só atualiza se mudou
        const antigaHH = toBRTime(b.data_batida);
        if (antigaHH !== b.horaStr) {
          await updateBatida({
            id: b.id,
            data_batida: novoDateTime,
            descricao: `${motivo} (ajuste de ${antigaHH} → ${b.horaStr})`,
          });
        }
      }
      onSave?.(); // recarrega tabela
      onHide?.();
    } catch (e) {
      console.error(e);
      alert("Falha ao salvar correções.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop="static">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="d-flex align-items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span>Editar batidas — {title}</span>
          </div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!day ? (
          <div className="text-muted">Selecione um dia.</div>
        ) : (
          <>
            <Row className="g-2 mb-3">
              {localBatidas.map((b, idx) => (
                <Col xs={6} key={b.id}>
                  <Form.Group>
                    <Form.Label className="small">Batida {idx + 1}</Form.Label>
                    <Form.Control
                      type="time"
                      value={(b.horaStr || "").slice(0,5)}
                      onChange={(e) =>
                        setLocalBatidas((prev) =>
                          prev.map((x) =>
                            x.id === b.id ? { ...x, horaStr: e.target.value } : x
                          )
                        )
                      }
                    />
                  </Form.Group>
                </Col>
              ))}
              {localBatidas.length === 0 && (
                <Col xs={12} className="text-muted small">Sem batidas neste dia.</Col>
              )}
            </Row>

            <div className="mb-3">
              <strong>Jornada estimada:</strong> {jornada}
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Motivo da correção</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex.: Esqueceu de bater retorno do almoço, ajuste conforme ponto do sistema."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onHide}>Cancelar</Button>
              <Button variant="primary" onClick={salvar} disabled={loading}>
                {loading ? <Spinner size="sm" /> : <Save size={16} className="me-1" />} Salvar alterações
              </Button>
            </div>

            <hr className="my-4" />
            <h6 className="mb-2">Auditoria</h6>
            <CorrecoesAudit logs={logs} />
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
