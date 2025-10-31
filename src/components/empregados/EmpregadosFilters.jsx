// src/components/empregados/EmpregadosFilters.jsx
import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { Search } from "lucide-react";

export default function EmpregadosFilters({
  mes, setMes,
  ano, setAno,
  colaboradorSelecionado, setColaboradorSelecionado,
  colaboradores,
  onBuscar,
}) {
  return (
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-body">
        <Row className="g-3 align-items-end">
          <Col md={2}>
            <Form.Label>Mês</Form.Label>
            <Form.Select value={mes} onChange={e => setMes(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Ano</Form.Label>
            <Form.Control type="number" value={ano} onChange={e => setAno(Number(e.target.value))} />
          </Col>
          <Col md={5}>
            <Form.Label>Empregado</Form.Label>
            <Form.Select
              value={colaboradorSelecionado}
              onChange={(e) => setColaboradorSelecionado(e.target.value)}
            >
              <option value="">Selecione...</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.matricula ?? c.id})
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} className="text-end">
            <Button variant="primary" className="px-4" onClick={onBuscar}>
              <Search size={18} className="me-2" /> Buscar
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}
