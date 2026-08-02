/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const isLocalProd = !!process.env.PLAYWRIGHT_PROD;

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,

  reporter: [
    ["list"], // <-- THIS makes GitHub Actions show passing tests
    ["html"],
  ],
  preserveOutput: "failures-only",

  use: {
    baseURL:
      process.env.BASE_URL ??
      (isCI || isLocalProd ? "http://127.0.0.1:3000" : "http://localhost:5173"),

    trace: "on",
    screenshot: "only-on-failure",

    // Prevent infinite hangs
    navigationTimeout: 15000,
  },

  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],

  webServer: {
    command:
      isCI || isLocalProd
        ? "vite preview --host 127.0.0.1 --port 3000"
        : "npm run dev",

    url:
      isCI || isLocalProd ? "http://127.0.0.1:3000" : "http://localhost:5173",

    // CI must NOT reuse the server
    reuseExistingServer: !isCI,

    timeout: 120000,
  },
});
