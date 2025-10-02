import { http } from "./http";

export function listarUsuarios() {
  return http.get("/usuarios/");
}
