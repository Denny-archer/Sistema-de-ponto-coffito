import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Clock } from "lucide-react";
import { http } from "../../services/http";

function DetalhesPontoDiario({ colaboradorId, dataSelecionada }) {
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!colaboradorId || !dataSelecionada) return;
    carregarDados();
  }, [colaboradorId, dataSelecionada]);

  async function carregarDados() {
    setLoading(true);
    try {
      const dataISO = dataSelecionada.toISOString().split("T")[0];

      // Faz as duas requisições em paralelo
      const [respSaldo, respUsuarios] = await Promise.all([
        http.get(`/batidas/saldo_diario/${colaboradorId}?data=${dataISO}`),
        http.get(`/usuarios/?skip=0&sort=false`),
      ]);

      const dadosSaldo = respSaldo.data;
      const usuario = respUsuarios.data.usuarios.find(u => u.id === colaboradorId);

      // 🔹 Usa a carga horária do usuário ou um valor padrão
      const horasPrevistas = usuario?.carga_horaria
        ? usuario.carga_horaria.slice(0, 5)
        : "08:00";

      // 🔹 Calcula horas realizadas (diferença entre entrada e saída)
      let horasRealizadas = "00:00";
      if (dadosSaldo.entrada && dadosSaldo.saida) {
        const entrada = new Date(dadosSaldo.entrada);
        const saida = new Date(dadosSaldo.saida);
        const diffMs = saida - entrada;
        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
        horasRealizadas = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
      } else if (dadosSaldo.entrada && !dadosSaldo.saida) {
        horasRealizadas = "Em andamento";
      }

      // 🔹 Determina a situação (positivo, negativo, zerado)
      let situacao = "zerado";
      if (dadosSaldo.saldo_diario?.startsWith("-")) situacao = "negativo";
      else if (dadosSaldo.saldo_diario?.startsWith("+")) situacao = "positivo";

      setSaldo({
        nome: dadosSaldo.nome,
        data: dadosSaldo.data,
        horasPrevistas,
        horasRealizadas,
        saldoDiario: dadosSaldo.saldo_diario || "00:00",
        situacao,
      });
    } catch (error) {
      console.error("❌ Erro ao carregar saldo diário:", error);
    } finally {
      setLoading(false);
    }
  }

  const getIconeSituacao = () => {
    if (saldo?.situacao === "positivo")
      return <ArrowUpCircle size={18} className="text-success me-1" />;
    if (saldo?.situacao === "negativo")
      return <ArrowDownCircle size={18} className="text-danger me-1" />;
    return <MinusCircle size={18} className="text-muted me-1" />;
  };

  return (
    <div className="mt-4">
      <h6 className="fw-bold mb-3 d-flex align-items-center">
        <Clock size={18} className="text-primary me-2" />
        Resumo Diário
      </h6>

      {loading ? (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" className="me-2" />
          Carregando saldo...
        </div>
      ) : saldo ? (
        <div className="card border-0 shadow-sm p-3">
          <Row className="text-center align-items-center">
            <Col xs={4}>
              <p className="text-muted mb-1 small">Previstas</p>
              <h6 className="fw-bold text-dark">{saldo.horasPrevistas}</h6>
            </Col>
            <Col xs={4}>
              <p className="text-muted mb-1 small">Realizadas</p>
              <h6 className="fw-bold text-dark">{saldo.horasRealizadas}</h6>
            </Col>
            <Col xs={4}>
              <p className="text-muted mb-1 small">Saldo</p>
              <div className="d-flex justify-content-center align-items-center">
                {getIconeSituacao()}
                <h6
                  className={`fw-bold mb-0 ${
                    saldo.situacao === "positivo"
                      ? "text-success"
                      : saldo.situacao === "negativo"
                      ? "text-danger"
                      : "text-muted"
                  }`}
                >
                  {saldo.saldoDiario}
                </h6>
              </div>
            </Col>
          </Row>

          <div className="text-center mt-3 border-top pt-2">
            <small className="text-muted">
              {saldo.nome} — {new Date(saldo.data).toLocaleDateString("pt-BR")}
            </small>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted py-3">
          Nenhum saldo disponível para esta data.
        </div>
      )}
    </div>
  );
}

export default DetalhesPontoDiario;
