/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  globalSetup: "./e2e/global-setup.ts",

  fullyParallel: false, // 🚀 Keep false or low workers if hitting a single shared test database
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  maxFailures: process.env.CI ? 1 : undefined, // 🚀 automatic ail-Fast
  workers: process.env.CI ? 1 : undefined, // Dropping to 1 worker on CI stops concurrent write database conflicts
  timeout: 90_000, // 90 seconds total test timeout limit

  reporter: process.env.CI
    ? [["github"], ["line"], ["html", { open: "never" }]]
    : [["list"], ["html"]],

  preserveOutput: "failures-only",

  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on",
    screenshot: "only-on-failure",
    // 🚀 SCALE TIMEOUTS FOR THE REMOTE BACKEND
    actionTimeout: 20000, // 20s allowance for clicks and fills
    navigationTimeout: 30000, // 30s allowance for page transitions/networkidle
  },

  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],

  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 3000 --single",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
