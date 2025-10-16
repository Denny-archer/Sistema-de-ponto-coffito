import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 🔹 necessário para funcionar dentro do container
    port: 5173,
    strictPort: true,
    allowedHosts: ["all"], // 🔹 permite qualquer host acessar (local, IP, ngrok, etc.)
    cors: true, // 🔹 habilita CORS do dev server
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
  },
});
