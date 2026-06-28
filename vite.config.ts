import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    root: ".",
    define: {
      'import.meta.env': JSON.stringify(env)
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
