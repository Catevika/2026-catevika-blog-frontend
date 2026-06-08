import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

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
              configure: (proxy) => {
                proxy.on("proxyRes", (proxyRes) => {
                  // Log to confirm the header is preserved
                  const retry = proxyRes.headers["retry-after"];
                  if (retry) {
                    console.log("Proxy forwarding Retry-After:", retry);
                  } else {
                    // If backend did NOT send a Retry-After header,
                    // ensure no stale header is forwarded
                    delete proxyRes.headers["retry-after"];
                    return;
                  }
                });
              },
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

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
