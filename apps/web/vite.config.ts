import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(import.meta.dirname, "../.."), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    server: {
      port: 3000
    },
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        "@rp/shared": resolve(import.meta.dirname, "src/shared"),
        "@admin": resolve(import.meta.dirname, "src/admin"),
        "@site": resolve(import.meta.dirname, "src/site"),
        "@dashboard": resolve(import.meta.dirname, "src/dashboard"),
        "@info": resolve(import.meta.dirname, "src/info"),
        "@sponsor": resolve(import.meta.dirname, "src/sponsor"),
        "@hype": resolve(import.meta.dirname, "src/hype")
      }
    }
  };
});
