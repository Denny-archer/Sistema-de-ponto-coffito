import { useContext } from "react";
import { http } from "../services/http";
import { UserContext } from "../context/UserProvider";

export default function useUser() {
  const { user, setUser, clearUser } = useContext(UserContext);

  async function fetchUser() {
    try {
      const { data } = await http.get("/usuarios/me");
      setUser(data);
      return data; // ✅ devolve o usuário autenticado
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      clearUser();
      return null;
    }
  }

  return { user, setUser, clearUser, fetchUser };
}
