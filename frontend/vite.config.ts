import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // @ts-expect-error - Vite's older type definitions sometimes miss the 'drop' property, 
    // but esbuild fully supports it and it works perfectly to strip logs in production.
    drop: ['console', 'debugger'],
  },
});