// src/pages/colaboradores/index.jsx
import React, { useState } from "react";
import { useColaboradores } from "./hooks/useColaboradores";
import { useFormColaborador } from "./hooks/useFormColaborador";
import ColaboradoresHeader from "./components/ColaboradoresHeader";
import FiltrosColaboradores from "./components/FiltrosColaboradores";
import ColaboradoresTable from "./components/ColaboradoresTable";
import ColaboradorModal from "./components/ColaboradorModal";
import "./colaboradores.css";

export default function ColaboradoresPage() {
  const {
    colaboradores,
    departamentosApi,
    cargosApi,
    loading,
    form,
    setForm,
    modo,
    setModo,
    novoColaborador,   // ⬅️ usar para zerar form
    handleSort,
    handleExcluir,
    handleSalvar,
    handleEditar,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterDepartamento,
    setFilterDepartamento,
    sortField,
    sortDirection,
  } = useColaboradores();

  const { validarFormulario } = useFormColaborador();
  const [showModal, setShowModal] = useState(false);

  const onSave = async (formData) => {
    // 👉 regra atual: valida tudo só no modo "novo".
    if (modo === "novo" && !validarFormulario(formData)) return;
    await handleSalvar(formData);
    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <div className="container-fluid py-3 py-md-4 px-3 px-md-4">
          <ColaboradoresHeader
            total={colaboradores.length}
            onAdd={() => {
              novoColaborador();    // ⬅️ limpa form + seta modo "novo"
              setShowModal(true);
            }}
            onRefresh={() => window.location.reload()}
            loading={loading}
          />

          <FiltrosColaboradores
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterDepartamento={filterDepartamento}
            onDepartamentoChange={setFilterDepartamento}
            departamentos={departamentosApi}
          />

          <div className="card shadow-sm">
            <div className="card-body p-0">
              <ColaboradoresTable
                colaboradores={colaboradores}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onExcluir={handleExcluir}
                onEditar={async (colab) => {
                  await handleEditar(colab); // ⬅️ carrega detalhes
                  setShowModal(true);
                }}
              />
            </div>
          </div>

          <ColaboradorModal
            show={showModal}
            form={form}
            setForm={setForm}
            onClose={() => {
              setShowModal(false);
              setModo("novo");
            }}
            onSave={onSave}
            loading={loading}
            departamentos={departamentosApi}
            cargos={cargosApi}
            modo={modo}
          />
        </div>
      </main>
    </div>
  );
}
