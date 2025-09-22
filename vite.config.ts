import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: si despliegas en GitHub Pages, cambia base por "/<nombre-del-repo>/"
export default defineConfig({
  plugins: [react()],
  base: "/CalendarTS/",
});
