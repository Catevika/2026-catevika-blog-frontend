/// <reference types="node" />
import { defineConfig } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: path.resolve("./e2e/global-setup.ts"),

  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  retries: 0,
  maxFailures: process.env.CI ? 1 : undefined,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,

  expect: {
    timeout: 10000, // Reduced from 15s because local requests resolve in <5ms
  },

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

  // 🚀 THE PRO CROSS-BROWSER MATRIX
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    {
      name: "firefox",
      use: {
        browserName: "firefox",
        // Force Firefox to allow cross-origin loopback cookies during the local test suite
        launchOptions: {
          firefoxUserPrefs: {
            "network.cookie.sameSite.laxByDefault": false,
            "network.cookie.sameSite.noneRequiresSecure": false,
            "privacy.firstparty.isolate": false,
            "privacy.partition.network_state": false,
          },
        },
      },
    },
    { name: "webkit", use: { browserName: "webkit" } },
  ],

  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
