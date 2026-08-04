/// <reference types="node" />
import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import type { PreviewServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { EventEmitter } from "node:events";

export default defineConfig(({ mode }) => {
  const isTest = mode === "test";

  // 🚀 THE ENVIRONMENT MATRIX FIX:
  // Detect if the code is compiling inside an automated CI runner (GitHub Actions)
  const isCI = process.env.CI === "true";

  // Inject environment variables for Playwright + Vitest
  if (isTest) {
    process.env.VITEST = "true";
    process.env.TEST_RATE_LIMITER = "false";
  }

  // 🚀 THE LOGICAL OVERWRITE:
  // Only route traffic to your live Render server during the real public build for Vercel users.
  // During local development or active testing cycles (isCI), stay locked onto the local port 4000.
  const apiTarget =
    mode === "production" && !isCI
      ? "https://two026-blog-app-backend.onrender.com"
      : "http://127.0.0.1:4000";

  const proxyConfig = {
    "/api": {
      target: apiTarget,
      changeOrigin: true,
      configure: (proxy: EventEmitter) => {
        proxy.on("proxyRes", (proxyRes: IncomingMessage) => {
          const retry = proxyRes.headers["retry-after"];
          if (retry) {
            console.log("Proxy forwarding Retry-After:", retry);
          } else {
            delete proxyRes.headers["retry-after"];
          }
        });
      },
    },
  };

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],

    server: {
      port: 5173,
      proxy: isTest ? undefined : proxyConfig,
    },

    preview: {
      port: 4173,
      proxy: isTest ? undefined : proxyConfig,
      configurePreviewServer: (server: PreviewServer) => {
        server.middlewares.use(
          (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
            if (
              req.url &&
              !req.url.includes(".") &&
              !req.url.startsWith("/api")
            ) {
              req.url = "/index.html";
            }
            next();
          },
        );
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
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
