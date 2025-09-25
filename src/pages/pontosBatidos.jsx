import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { Download, ArrowLeft, Clock, CalendarDays, BarChart3, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import "react-calendar/dist/Calendar.css";

function PontosBatidos() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [baixando, setBaixando] = useState(false);
  const [viewMode, setViewMode] = useState("dia"); // 'dia' ou 'mes'

  // Mock registros - dados mais realistas
  const registros = [
    {
      data: "23/09/2025",
      batidas: ["08:00", "12:00", "13:02", "17:00"],
      horasTrabalhadas: "07:58",
      horasPrevistas: "08:00",
      bancoHoras: "-00:02",
      status: "completo",
      observacao: "Pausa almoço de 1h02min"
    },
    {
      data: "24/09/2025",
      batidas: ["08:00", "12:00", null, null],
      horasTrabalhadas: "04:00",
      horasPrevistas: "08:00",
      bancoHoras: "-04:00",
      status: "incompleto",
      observacao: "Saída antecipada"
    },
    {
      data: "25/09/2025",
      batidas: ["07:55", "12:10", "13:05", "17:15"],
      horasTrabalhadas: "08:25",
      horasPrevistas: "08:00",
      bancoHoras: "+00:25",
      status: "completo",
      observacao: "Horas extras"
    }
  ];

  const resumoMes = {
    horasTrabalhadas: "139:27",
    horasPrevistas: "176:00",
    bancoHoras: "-00:10",
    horasPositivas: "00:44",
    horasNegativas: "-00:54",
    bancoAcumuladoAnterior: "-00:05",
    bancoMes: "-00:10",
    diasTrabalhados: 22,
    diasUteis: 23,
    percentual: "96%"
  };

  const formatDate = (date) => date.toLocaleDateString("pt-BR");

  const getDayStatus = (date) => {
    const dataStr = formatDate(date);
    const registro = registros.find((r) => r.data === dataStr);
    
    if (!registro) return "sem-registro";
    if (registro.status === "incompleto") return "incompleto";
    if (parseFloat(registro.bancoHoras.replace(':', '.')) > 0) return "positivo";
    if (parseFloat(registro.bancoHoras.replace(':', '.')) < 0) return "negativo";
    return "completo";
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const status = getDayStatus(date);
    const isToday = formatDate(date) === formatDate(new Date());
    
    return (
      <div className="d-flex justify-content-center mt-1">
        {isToday && <div className="dot-indicator bg-primary" style={{width: '4px', height: '4px', borderRadius: '50%'}}></div>}
        {status !== "sem-registro" && (
          <div className={`dot-indicator ${
            status === "completo" ? "bg-success" :
            status === "positivo" ? "bg-info" :
            status === "negativo" ? "bg-warning" :
            "bg-danger"
          }`} style={{width: '6px', height: '6px', borderRadius: '50%', marginLeft: '2px'}}></div>
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const isToday = formatDate(date) === formatDate(new Date());
    const status = getDayStatus(date);
    
    let classes = [];
    if (isToday) classes.push('border border-primary border-2');
    if (status !== "sem-registro") classes.push('has-registry');
    
    return classes.join(' ');
  };

  const detalheDia = useMemo(() => {
    const dataStr = formatDate(selectedDate);
    return registros.find((r) => r.data === dataStr) || null;
  }, [selectedDate, registros]);

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Simular download real aqui
      alert("✅ Comprovante baixado com sucesso!");
    } catch {
      alert("❌ Erro ao baixar comprovante");
    } finally {
      setBaixando(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completo": return <CheckCircle2 size={16} className="text-success" />;
      case "incompleto": return <XCircle size={16} className="text-danger" />;
      case "positivo": return <AlertCircle size={16} className="text-info" />;
      case "negativo": return <AlertCircle size={16} className="text-warning" />;
      default: return <Clock size={16} className="text-muted" />;
    }
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 py-md-4 px-3 px-md-4 bg-light">
      {/* Header */}
      <div className="w-100 mb-3 mb-md-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm me-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="me-2" />
            <span className="d-none d-sm-inline">Voltar</span>
          </button>
          <div>
            <h2 className="fw-bold mb-0 d-flex align-items-center">
              <CalendarDays size={24} className="text-primary me-2" />
              Pontos Batidos
            </h2>
            <small className="text-muted">Controle e acompanhamento de registros</small>
          </div>
        </div>
      </div>

      <div className="row justify-content-center flex-grow-1">
        <div className="col-12 col-xl-10">
          <div className="row g-3 g-md-4">
            {/* Calendário */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <CalendarDays size={18} className="me-2" />
                      Calendário
                    </h5>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className={`btn ${viewMode === 'dia' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('dia')}
                      >
                        Dia
                      </button>
                      <button 
                        className={`btn ${viewMode === 'mes' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('mes')}
                      >
                        Mês
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="pt-BR"
                    defaultView="month"
                    showNavigation={true}
                    activeStartDate={activeStartDate}
                    onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    className="w-100 border-0"
                  />
                  
                  {/* Legenda */}
                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted d-block mb-2">Legenda:</small>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="d-flex align-items-center">
                        <div className="dot-indicator bg-success me-1" style={{width: '8px', height: '8px', borderRadius: '50%'}}></div>
                        <small>Completo</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="dot-indicator bg-info me-1" style={{width: '8px', height: '8px', borderRadius: '50%'}}></div>
                        <small>Positivo</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="dot-indicator bg-warning me-1" style={{width: '8px', height: '8px', borderRadius: '50%'}}></div>
                        <small>Negativo</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="dot-indicator bg-danger me-1" style={{width: '8px', height: '8px', borderRadius: '50%'}}></div>
                        <small>Incompleto</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do Dia/Resumo do Mês */}
            <div className="col-12 col-lg-6">
              {viewMode === "dia" ? (
                /* Detalhe do Dia */
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <Clock size={18} className="me-2" />
                      Detalhes do Dia - {formatDate(selectedDate)}
                    </h5>
                  </div>
                  <div className="card-body">
                    {detalheDia ? (
                      <>
                        {/* Status */}
                        <div className="d-flex align-items-center mb-3 p-3 rounded bg-light">
                          {getStatusIcon(detalheDia.status)}
                          <span className="ms-2 fw-medium">
                            {detalheDia.status === "completo" ? "Dia completo" :
                             detalheDia.status === "incompleto" ? "Dia incompleto" :
                             detalheDia.status === "positivo" ? "Horas positivas" : "Horas negativas"}
                          </span>
                        </div>

                        {/* Batidas */}
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3">Batidas de Ponto</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {detalheDia.batidas.map((hora, index) => (
                              <div key={index} className="d-flex align-items-center">
                                <span className="badge bg-secondary me-1">{index + 1}</span>
                                <span className={`badge ${hora ? "bg-primary" : "bg-light text-muted border"} p-2`}>
                                  {hora || "Não registrado"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumo */}
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="text-center p-2 bg-light rounded">
                              <small className="text-muted d-block">Trabalhadas</small>
                              <strong className="text-primary">{detalheDia.horasTrabalhadas}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-2 bg-light rounded">
                              <small className="text-muted d-block">Previstas</small>
                              <strong>{detalheDia.horasPrevistas}</strong>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className={`text-center p-2 rounded ${
                              detalheDia.bancoHoras.startsWith('+') ? 'bg-success bg-opacity-10 text-success' :
                              detalheDia.bancoHoras.startsWith('-') ? 'bg-warning bg-opacity-10 text-warning' :
                              'bg-light'
                            }`}>
                              <small className="text-muted d-block">Banco de Horas</small>
                              <strong>{detalheDia.bancoHoras}</strong>
                            </div>
                          </div>
                        </div>

                        {detalheDia.observacao && (
                          <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
                            <small className="text-muted">Observação:</small>
                            <div className="small">{detalheDia.observacao}</div>
                          </div>
                        )}

                        <button className="btn btn-outline-warning w-100 mt-3 btn-sm">
                          Incluir Solicitação
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <Clock size={48} className="text-muted mb-3" />
                        <p className="text-muted">Nenhum registro para este dia.</p>
                        <small className="text-muted">Selecione uma data com registros</small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Resumo do Mês */
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <BarChart3 size={18} className="me-2" />
                      Resumo do Mês - Setembro/2025
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Métricas principais */}
                      <div className="col-6">
                        <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                          <small className="text-muted d-block">Trabalhadas</small>
                          <strong className="text-primary fs-5">{resumoMes.horasTrabalhadas}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center p-3 bg-light rounded">
                          <small className="text-muted d-block">Previstas</small>
                          <strong className="fs-5">{resumoMes.horasPrevistas}</strong>
                        </div>
                      </div>
                      
                      {/* Banco de Horas */}
                      <div className="col-12">
                        <div className={`text-center p-3 rounded ${
                          resumoMes.bancoHoras.startsWith('+') ? 'bg-success text-white' :
                          resumoMes.bancoHoras.startsWith('-') ? 'bg-warning text-dark' :
                          'bg-secondary text-white'
                        }`}>
                          <small className="opacity-90 d-block">Saldo do Mês</small>
                          <strong className="fs-4">{resumoMes.bancoHoras}</strong>
                        </div>
                      </div>

                      {/* Detalhes */}
                      <div className="col-12">
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Dias trabalhados</small>
                            <strong>{resumoMes.diasTrabalhados}/{resumoMes.diasUteis}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Percentual</small>
                            <strong>{resumoMes.percentual}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Horas positivas</small>
                            <strong className="text-success">{resumoMes.horasPositivas}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Horas negativas</small>
                            <strong className="text-warning">{resumoMes.horasNegativas}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão Download */}
          <div className="text-center mt-4">
            <button
              className="btn btn-primary btn-lg px-4"
              onClick={handleDownload}
              disabled={baixando}
            >
              {baixando ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Baixando...</span>
                  </div>
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download size={20} className="me-2" />
                  Baixar Relatório Completo
                </>
              )}
            </button>
            <small className="d-block text-muted mt-2">
              Relatório em PDF com todos os dados do mês
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PontosBatidos;