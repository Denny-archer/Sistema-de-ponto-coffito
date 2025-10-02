import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

/**
 * Hook para acessar o contexto de autenticação em qualquer componente.
 * 
 * Exemplo de uso:
 * const { user, signIn, signOut, isAuthenticated } = useAuth();
 */
export default function useAuth() {
  return useContext(AuthContext);
}
