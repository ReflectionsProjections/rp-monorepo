import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const sharedEnv = loadEnv(mode, resolve(__dirname, "../../.."), "");

  for (const [key, value] of Object.entries(sharedEnv)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    server: {
      port: 3003
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@rp/shared": resolve(__dirname, "../../shared/src")
      }
    }
  };
});
