import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const appEnv = loadEnv(mode, __dirname, "");
  const rootEnv = loadEnv(mode, resolve(__dirname, "../../../.."), "");
  const mergedEnv = { ...rootEnv, ...appEnv };

  for (const [key, value] of Object.entries(mergedEnv)) {
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
