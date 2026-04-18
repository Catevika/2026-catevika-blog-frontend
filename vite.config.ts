import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isTest: boolean = mode === "test";

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],

    server: {
      proxy: isTest
        ? undefined
        : {
            "/api": {
              target: "http://localhost:4000",
              changeOrigin: true,
            },
          },
    },

    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./tests/setup.ts",
      include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      css: false,
    },
  };
});
