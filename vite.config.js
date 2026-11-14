import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative paths work for both GitHub Pages project URLs and local preview.
  base: "./"
});
