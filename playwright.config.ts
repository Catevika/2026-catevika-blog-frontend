/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: "html",

  // Keep the output of the LAST run only
  preserveOutput: "failures-only",

  use: {
    baseURL: "http://localhost:5173",
    // video: "on", // record videos for ALL tests
    trace: "on", // record trace for ALL tests
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],

  webServer: {
    command: "npm run preview",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
