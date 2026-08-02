/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  retries: 0,
  maxFailures: process.env.CI ? 1 : undefined, // Stop at 1st failure to save time

  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,

  reporter: process.env.CI
    ? [["github"], ["line"], ["html", { open: "never" }]]
    : [["list"], ["html"]],

  preserveOutput: "failures-only",

  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },

  projects: [{ name: "chromium", use: { browserName: "chromium" } }],

  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
