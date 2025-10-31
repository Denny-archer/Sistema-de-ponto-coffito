import Swal from "sweetalert2";
import { validarCPF } from "../utils/validarCPF";

// 💡 Validação de e-mail moderna e realista (RFC 5322 simplificada)
const validarEmail = (email) => {
  if (!email) return false;
  const regex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
};

export function useFormColaborador() {
  const validarFormulario = (form) => {
    if (!form.nome?.trim()) {
      Swal.fire("Campo obrigatório", "Informe o nome do colaborador.", "warning");
      return false;
    }

    if (!validarEmail(form.email)) {
      Swal.fire("E-mail inválido", "Digite um e-mail válido.", "warning");
      return false;
    }

    if (!validarCPF(form.cpf)) {
      Swal.fire("CPF inválido", "Digite um CPF válido com 11 dígitos.", "warning");
      return false;
    }

    if (!form.password?.trim() || form.password.length < 6) {
      Swal.fire(
        "Senha obrigatória",
        "Informe uma senha inicial com pelo menos 6 caracteres.",
        "warning"
      );
      return false;
    }

    if (!form.matricula?.trim()) {
      Swal.fire(
        "Matrícula obrigatória",
        "Informe a matrícula do colaborador.",
        "warning"
      );
      return false;
    }

    // Validação extra (opcional): carga horária deve ter formato HH:mm
    if (form.cargaHoraria && !/^\d{2}:\d{2}$/.test(form.cargaHoraria)) {
      Swal.fire(
        "Carga horária inválida",
        "Informe a carga horária no formato HH:mm (ex: 08:00).",
        "warning"
      );
      return false;
    }

    return true;
  };

  return { validarFormulario };
}
