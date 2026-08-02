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
    command:
      "VITE_API_URL=https://two026-blog-app-backend.onrender.com vite preview --host 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
