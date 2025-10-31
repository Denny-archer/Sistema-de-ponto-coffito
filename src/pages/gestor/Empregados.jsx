// src/pages/gestor/Empregados.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";
import EmpregadosFilters from "../../components/empregados/EmpregadosFilters";
import EmpregadosTable from "../../components/empregados/EmpregadosTable";
import DayEditorDrawer from "../../components/empregados/DayEditorDrawer";
import { fetchUsuarios, fetchBatidas } from "../../services/batidas";
import { normalizeDayKey, toBRDate, toBRTime, diffHHmm } from "../../utils/time";

// 🧾 PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function Empregados() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [colaboradores, setColaboradores] = useState([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState("");
  const [loading, setLoading] = useState(false);

  const [linhas, setLinhas] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchUsuarios();
        setColaboradores(list);
      } catch (e) {
        console.error("Erro ao carregar colaboradores", e);
      }
    })();
  }, []);

  const dataInicio = useMemo(
    () => `${ano}-${String(mes).padStart(2, "0")}-01`,
    [ano, mes]
  );
  const dataFim = useMemo(
    () => `${ano}-${String(mes).padStart(2, "0")}-31`,
    [ano, mes]
  );

  async function buscarBatidas() {
    if (!colaboradorSelecionado) return;
    setLoading(true);
    try {
      const raw = await fetchBatidas({
        idUsuario: colaboradorSelecionado,
        dataInicio,
        dataFim,
      });
      setLinhas(groupByDay(raw, Number(colaboradorSelecionado)));
    } catch (e) {
      console.error("Erro ao carregar batidas", e);
    } finally {
      setLoading(false);
    }
  }

  function groupByDay(batidas, idUsuario) {
    const map = new Map();
    for (const b of batidas) {
      const key = normalizeDayKey(b.data_batida);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    }

    const out = [];
    for (const [diaISO, arr] of map.entries()) {
      arr.sort((a, b) => new Date(a.data_batida) - new Date(b.data_batida));

      const entrada = arr[0]?.data_batida ? toBRTime(arr[0].data_batida).slice(0, 5) : "--:--";
      const pausa = arr[1]?.data_batida ? toBRTime(arr[1].data_batida).slice(0, 5) : "--:--";
      const retorno = arr[2]?.data_batida ? toBRTime(arr[2].data_batida).slice(0, 5) : "--:--";
      const saida = arr[3]?.data_batida ? toBRTime(arr[3].data_batida).slice(0, 5) : "--:--";
      const jornada =
        arr.length >= 2
          ? diffHHmm(arr[0].data_batida, arr[arr.length - 1].data_batida)
          : "00:00";

      const eventosExtras = arr.slice(4).map((x) => x.descricao).filter(Boolean);

      out.push({
        idUsuario,
        diaISO,
        label: toBRDate(diaISO) || diaISO,
        entrada,
        pausa,
        retorno,
        saida,
        jornada,
        apontamento: "H. Trabalhadas",
        eventos: eventosExtras,
        grupoOrdenado: arr,
      });
    }

    out.sort((a, b) => (a.diaISO > b.diaISO ? -1 : 1));
    return out;
  }

  function openDay(d) {
    setSelectedDay(d);
    setDrawerOpen(true);
  }

  // =========================================
  // 🧾 Função: Exportar PDF de um dia
  // =========================================
  function handleExportDia(dia) {
  try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Relatório Diário de Ponto", 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Colaborador: ${colaboradores.find((c) => c.id === dia.idUsuario)?.nome || "N/A"}`,
        14,
        30
      );
      doc.text(`Data: ${dia.label}`, 14, 38);

      const tableData = [
        ["Entrada", dia.entrada],
        ["Pausa", dia.pausa],
        ["Retorno", dia.retorno],
        ["Saída", dia.saida],
        ["Jornada", dia.jornada],
        ["Status", dia.saida === "--:--" ? "Incompleto" : "Completo"],
      ];

      autoTable(doc, {
        head: [["Campo", "Valor"]],
        body: tableData,
        startY: 48,
        theme: "grid",
        styles: { halign: "center", valign: "middle" },
        headStyles: { fillColor: [0, 200, 167] }, // verde PontoPro
      });

      const endY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("Assinatura do Colaborador: ____________________________", 14, endY + 15);
      doc.text("Assinatura do Gestor: ________________________________", 14, endY + 25);

      doc.save(`Relatorio_${dia.label.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
    }
  }


  return (
    <div className="container-fluid py-3 px-3">
      <h4 className="fw-bold mb-3">Verificação de Folhas de Ponto</h4>

      <EmpregadosFilters
        mes={mes}
        setMes={setMes}
        ano={ano}
        setAno={setAno}
        colaboradores={colaboradores}
        colaboradorSelecionado={colaboradorSelecionado}
        setColaboradorSelecionado={setColaboradorSelecionado}
        onBuscar={buscarBatidas}
      />

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-5 text-center text-muted">
              <div className="spinner-border" role="status" />
              <div className="mt-2">Carregando registros...</div>
            </div>
          ) : (
            <EmpregadosTable linhas={linhas} onOpenDay={openDay} onExportDia={handleExportDia} />
          )}
        </div>
      </div>

      <DayEditorDrawer
        show={drawerOpen}
        onHide={() => setDrawerOpen(false)}
        day={selectedDay}
        onSave={buscarBatidas}
      />
    </div>
  );
}
