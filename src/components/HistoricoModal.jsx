import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { FileText, Edit, Trash2, Eye, Plus } from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

/* ---------------------- Modal de Adicionar/Editar Ponto ---------------------- */
function PontoModal({ isOpen, onClose, ponto, colaborador, onSave }) {
  const [form, setForm] = useState({
    data: "",
    entrada1: "",
    saida1: "",
    entrada2: "",
    saida2: "",
    justificativa: "",
    tipo: "manual",
  });

  useEffect(() => {
    if (ponto) {
      setForm({
        data: ponto.data || "",
        entrada1: ponto.entrada1 || "",
        saida1: ponto.saida1 || "",
        entrada2: ponto.entrada2 || "",
        saida2: ponto.saida2 || "",
        justificativa: ponto.justificativa || "",
        tipo: ponto.tipo || "manual",
      });
    }
  }, [ponto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-2xl shadow-xl p-6">
          <Dialog.Title className="text-lg font-bold mb-4">
            {ponto ? "Editar Ponto" : "Adicionar Ponto"} – {colaborador?.nome}
          </Dialog.Title>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              Data
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col">
              Entrada-1
              <input
                type="time"
                name="entrada1"
                value={form.entrada1}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col">
              Saída-1
              <input
                type="time"
                name="saida1"
                value={form.saida1}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col">
              Entrada-2
              <input
                type="time"
                name="entrada2"
                value={form.entrada2}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col">
              Saída-2
              <input
                type="time"
                name="saida2"
                value={form.saida2}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col col-span-2">
              Justificativa (opcional)
              <textarea
                name="justificativa"
                value={form.justificativa}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col col-span-2">
              Tipo
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="border rounded p-2"
              >
                <option value="manual">Inserção Manual</option>
                <option value="justificativa">Justificativa</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Salvar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

/* ---------------------- Modal de Histórico ---------------------- */
function HistoricoModal({ isOpen, onClose, colaborador }) {
  const [historico, setHistorico] = useState([]);
  const [openPontoModal, setOpenPontoModal] = useState(false);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Mock - trocar por fetch no backend
      setHistorico([
        {
          data: "2025-09-25",
          entrada1: "08:00",
          saida1: "12:00",
          entrada2: "13:00",
          saida2: "17:30",
          extras: "00:30",
          atraso: "00:00",
          banco: "+02:00",
          status: "Trabalhando",
          justificativa: null,
        },
        {
          data: "2025-09-24",
          entrada1: "08:15",
          saida1: "12:05",
          entrada2: "13:00",
          saida2: "17:20",
          extras: "00:10",
          atraso: "00:15",
          banco: "-00:15",
          status: "Atrasado",
          justificativa: "Esquecimento (Pendente)",
        },
      ]);
    }
  }, [isOpen]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Histórico de Pontos - ${colaborador.nome}`, 10, 10);
    historico.forEach((h, i) => {
      doc.text(
        `${h.data} | ${h.entrada1 || "--"} - ${h.saida2 || "--"} | ${h.status}`,
        10,
        20 + i * 10
      );
    });
    doc.save("historico.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(historico);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico");
    XLSX.writeFile(wb, "historico.xlsx");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Trabalhando":
        return "bg-green-100 text-green-700";
      case "Ausente":
        return "bg-red-100 text-red-700";
      case "Atrasado":
        return "bg-yellow-100 text-yellow-700";
      case "Finalizado":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white w-11/12 md:w-3/4 lg:w-2/3 rounded-2xl shadow-xl p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Histórico de Pontos – {colaborador.nome}
            </Dialog.Title>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => {
                  setPontoSelecionado(null);
                  setOpenPontoModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={18} /> Adicionar Ponto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Data</th>
                    <th className="p-2 border">Entrada-1</th>
                    <th className="p-2 border">Saída-1</th>
                    <th className="p-2 border">Entrada-2</th>
                    <th className="p-2 border">Saída-2</th>
                    <th className="p-2 border">Extras</th>
                    <th className="p-2 border">Atraso</th>
                    <th className="p-2 border">Banco</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Justificativa</th>
                    <th className="p-2 border">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{h.data}</td>
                      <td className="p-2 border">{h.entrada1 || "--"}</td>
                      <td className="p-2 border">{h.saida1 || "--"}</td>
                      <td className="p-2 border">{h.entrada2 || "--"}</td>
                      <td className="p-2 border">{h.saida2 || "--"}</td>
                      <td className="p-2 border">{h.extras || "--"}</td>
                      <td className="p-2 border">{h.atraso || "--"}</td>
                      <td className="p-2 border">{h.banco || "--"}</td>
                      <td className={`p-2 border text-center ${getStatusClass(h.status)}`}>
                        {h.status}
                      </td>
                      <td className="p-2 border">{h.justificativa || "--"}</td>
                      <td className="p-2 border flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setPontoSelecionado(h);
                            setOpenPontoModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <button
                  onClick={exportPDF}
                  className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <FileText size={16} /> PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  Excel
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de adicionar/editar ponto */}
      <PontoModal
        isOpen={openPontoModal}
        onClose={() => setOpenPontoModal(false)}
        ponto={pontoSelecionado}
        colaborador={colaborador}
        onSave={(dados) => console.log("Salvar no backend:", dados)}
      />
    </>
  );
}

export default HistoricoModal;
