import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const isTest = mode === "test";

  // Inject environment variables for Playwright + Vitest
  if (isTest) {
    process.env.VITEST = "true";
    process.env.TEST_RATE_LIMITER = "false";
  }

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
                  const retry = proxyRes.headers["retry-after"];
                  if (retry) {
                    console.log("Proxy forwarding Retry-After:", retry);
                  } else {
                    delete proxyRes.headers["retry-after"];
                  }
                });
              },
            },
          },
    },

    test: {
      environment: "jsdom",
      globals: true,
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      css: false,
      isolate: false,
      restoreMocks: true,
      clearMocks: true,
      mockReset: true,
      testTimeout: 10000,
      hookTimeout: 10000,
      setupFiles: [
        "tests/setup.ts",
        "./tests/setup/server.ts",
        "./tests/setup/setup-msw.ts",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "./coverage/frontend",
        exclude: ["tests/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
