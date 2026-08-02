/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,

  reporter: [["list"], ["html"]],

  preserveOutput: "failures-only",

  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on",
    screenshot: "only-on-failure",
    navigationTimeout: 15000,
  },

  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],

  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 60000, // 1 minute is plenty now that the build is already done
  },
});
