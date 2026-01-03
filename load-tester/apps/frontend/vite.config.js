import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: "127.0.0.1", // Bind to IPv4 for curl compatibility
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
  },
});
