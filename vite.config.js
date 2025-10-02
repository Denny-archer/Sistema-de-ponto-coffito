import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   
    port: 5173,
    allowedHosts: [
      "4724bf19bee6.ngrok-free.app", // 🔹 copie exatamente o host gerado pelo ngrok
    ]
  },
});
