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

  const publicEnv = {
    "import.meta.env.VITE_ENV": JSON.stringify(
      process.env.ENV ?? process.env.VITE_ENV
    ),
    "import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID": JSON.stringify(
      process.env.OAUTH_GOOGLE_CLIENT_ID ??
        process.env.VITE_GOOGLE_OAUTH_CLIENT_ID
    ),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      process.env.VITE_API_BASE_URL
    ),
    "import.meta.env.VITE_WS_BASE_URL": JSON.stringify(
      process.env.VITE_WS_BASE_URL
    )
  };

  return {
    server: {
      port: 3001
    },
    define: publicEnv,
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        "@app": resolve(import.meta.dirname, "app"),
        "@components": resolve(import.meta.dirname, "components"),
        "@hooks": resolve(import.meta.dirname, "hooks"),
        "@constants": resolve(import.meta.dirname, "constants"),
        "@assets": resolve(import.meta.dirname, "assets"),
        "@api": resolve(import.meta.dirname, "api"),
        "@lib": resolve(import.meta.dirname, "lib"),
        "@types": resolve(import.meta.dirname, "types")
      }
    }
  };
});
