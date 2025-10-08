import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Card, Spinner, Form, Image } from "react-bootstrap";
import { FaUser, FaLock, FaUserTie, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { fetchUser, clearUser } = useUser();

  const [showWelcome, setShowWelcome] = useState(true);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // 🌀 Tela de boas-vindas inicial
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Atualiza valores dos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Lógica principal de login
  const handleLogin = async (tipo) => {
    setErro("");
    setLoading(true);

    try {
      // Autentica e salva token
      await signIn({
        email: form.email,
        password: form.senha,
        remember: lembrar,
      });

      // Busca o usuário logado via token
      const usuario = await fetchUser();
      console.log("Usuário autenticado:", usuario);

      if (!usuario) throw new Error("Falha ao identificar usuário.");

      // Redirecionamento baseado no tipo
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
      const detail = err?.response?.data?.detail;
      if (detail) {
        if (Array.isArray(detail)) msg = detail.map((e) => e.msg).join(", ");
        else if (typeof detail === "string") msg = detail;
      }

      setErro(msg);
      Swal.fire({
        icon: "error",
        title: "Erro ao entrar",
        text: msg,
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Tela de boas-vindas animada
  if (showWelcome) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center bg-welcome animate-fade-in">
        <Image src={logo} alt="Logo" width={100} className="mb-4 animate-pop-in" />
        <h1 className="text-primary fw-bold animate-slide-up">Bem-vindo ao Sistema!</h1>
        <Spinner animation="border" variant="primary" className="mt-3" />
      </Container>
    );
  }

  // 🧩 Tela principal de login
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

          {erro && <div className="alert alert-danger py-2 text-sm mb-3">{erro}</div>}

          <Form>
            <Form.Group className="mb-3 d-flex align-items-center input-group-custom" controlId="formEmail">
              <FaUser className="me-2 icon-lg text-secondary" />
              <Form.Control
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3 d-flex align-items-center input-group-custom" controlId="formSenha">
              <FaLock className="me-2 icon-lg text-secondary" />
              <Form.Control
                type="password"
                name="senha"
                placeholder="Digite sua senha"
                value={form.senha}
                onChange={handleChange}
                required
              />
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

            {/* Botões de acesso */}
            <div className="d-flex flex-column gap-2 mt-3">
              <Button
                type="button"
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleLogin("gestor")}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaUserTie className="me-2" />
                )}
                Entrar como Gestor
              </Button>

              <Button
                type="button"
                variant="outline-primary"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleLogin("colaborador")}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaUsers className="me-2" />
                )}
                Entrar como Colaborador
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
