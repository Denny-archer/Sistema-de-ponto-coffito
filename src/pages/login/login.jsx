import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Card, Spinner, Form, Image } from "react-bootstrap";
import { FaUser, FaLock, FaUserTie, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { fetchUser, clearUser } = useUser();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTipo, setLoadingTipo] = useState(null);
  const [erro, setErro] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const loginOk = form.email.trim().length > 0;
  const senhaOk = form.senha.trim().length > 0;
  const formOk = loginOk && senhaOk;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (tipo) => {
    if (!formOk || loading) return;
    setErro("");
    setLoading(true);
    setLoadingTipo(tipo);

    try {
      await signIn({
        email: form.email,
        password: form.senha,
        remember: lembrar,
      });

      const usuario = await fetchUser();
      if (!usuario) throw new Error("Falha ao identificar usuário.");

      if (tipo === "gestor") {
        if (usuario.tipo_usuario === 1 || usuario.tipo_usuario === "Administrador") {
          navigate("/gestor", { replace: true });
        } else {
          Swal.fire({
            icon: "error",
            title: "Acesso negado",
            text: "Apenas gestores podem acessar esta área.",
            confirmButtonColor: "#0d6efd",
          });
        }
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("Erro no login:", err);
      clearUser();

      let msg = "Falha no login. Verifique suas credenciais.";
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) msg = "Usuário ou senha incorretos.";
      else if (status === 404) msg = "Usuário não encontrado.";
      else if (status === 422) msg = "Formato de dados inválido.";
      else if (err.message?.includes("Network")) msg = "Erro de conexão com o servidor.";
      else if (detail) {
        if (Array.isArray(detail)) msg = detail.map((e) => e.msg).join(", ");
        else if (typeof detail === "string") msg = detail;
      }

      setErro(msg);
      const card = document.querySelector(".login-card");
      if (card) {
        card.classList.add("error");
        setTimeout(() => card.classList.remove("error"), 500);
      }

      Swal.fire({
        icon: "error",
        title: "Erro ao entrar",
        text: msg,
        confirmButtonColor: "#0d6efd",
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
      setLoadingTipo(null);
    }
  };

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-login p-3 animate-fade-in"
    >
      <Image src={logo} alt="Logo" width={80} className="mb-4" />

      {/* Card Institucional */}
      <Card className="p-4 shadow-lg text-center w-100 mb-4 login-card" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <Card.Title className="fs-3 fw-bold text-primary">Sistema de Ponto Eletrônico</Card.Title>
          <Card.Text className="text-muted">
            Registre, acompanhe e gerencie seus horários de forma prática e segura.
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Card de Login */}
      <Card className="p-4 shadow-lg w-100 login-card" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <Card.Title className="fs-4 fw-bold text-primary text-center mb-4">Acesso ao Sistema</Card.Title>

          {erro && (
            <div className="alert alert-danger py-2 text-sm mb-3" role="alert" aria-live="polite">
              {erro}
            </div>
          )}

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin("colaborador");
            }}
            noValidate
          >
            {/* E-mail ou Matrícula */}
            <Form.Group className="mb-3 d-flex align-items-center input-group-custom" controlId="formLogin">
              <FaUser className="me-2 icon-lg text-secondary" />
              <Form.Control
                type="text"
                name="email"
                placeholder="Digite seu e-mail ou matrícula"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Senha */}
            <Form.Group
              className="mb-3 d-flex align-items-center input-group-custom position-relative"
              controlId="formSenha"
            >
              <FaLock className="me-2 icon-lg text-secondary" />
              <Form.Control
                type={showPwd ? "text" : "password"}
                name="senha"
                placeholder="Digite sua senha"
                value={form.senha}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-link px-2 position-absolute end-0 me-2"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                style={{ textDecoration: "none" }}
              >
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </Form.Group>

            <div className="d-flex align-items-center mb-3">
              <Form.Check
                type="checkbox"
                id="lembrar"
                label="Lembrar de mim"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
            </div>

            <div className="d-flex flex-column gap-2 mt-3">
              <Button
                type="button"
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleLogin("gestor")}
                disabled={loading}
              >
                {loadingTipo === "gestor" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> Entrando...
                  </>
                ) : (
                  <>
                    <FaUserTie className="me-2" /> Entrar como Gestor
                  </>
                )}
              </Button>

              <Button
                type="submit"
                variant="outline-primary"
                className="w-100 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loadingTipo === "colaborador" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> Entrando...
                  </>
                ) : (
                  <>
                    <FaUsers className="me-2" /> Entrar como Colaborador
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
