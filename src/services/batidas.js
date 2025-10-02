import { http } from "./http";

export function listarBatidas() {
  return http.get("/batidas/");
}
