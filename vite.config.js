import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // ← ajouter

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← ajouter
  ],
});
