import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

import userPhoto from "../assets/logo.png"

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👉 Aqui você pode validar usuário/senha futuramente
    console.log("Tentando logar...");

    // Se der certo, redireciona para Home
    navigate("/home");
  };

  return (
  <div className="login-container">
    <div className="logo-wrapper">
      <img src={userPhoto} alt="Logo Coffito" className="logo" />
    </div>

    <div className="login-box">
      <h2 className="login-title">Entrar na sua conta</h2>

      <form onSubmit={handleSubmit}>
        {/* Usuário/Email */}
        <div className="input-group">
          <input
            id="username"
            type="text"
            placeholder="Usuário ou E-mail"
            className="form-control"
            autoComplete="username"
            required
          />
        </div>

        {/* Senha */}
        <div className="input-group">
          <input
            id="password"
            type="password"
            placeholder="Senha"
            className="form-control"
            autoComplete="current-password"
            required
          />
        </div>

        {/* Opções */}
        <div className="options">
          <label>
            <input type="checkbox" /> Lembrar de mim
          </label>
          <a href="/recuperar-senha" className="forgot-link">
            Esqueci minha senha
          </a>
        </div>

        {/* Botão */}
        <button type="submit" className="btn-login">
          Entrar
        </button>
      </form>
    </div>
  </div>
);

}

export default Login;
