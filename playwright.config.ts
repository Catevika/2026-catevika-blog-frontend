/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  retries: 1,
  maxFailures: undefined,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,

  expect: {
    timeout: 10000,
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

  projects: [
    // 🚀 Clean & default for Chromium
    { name: "chromium", use: { browserName: "chromium" } },

    // 🚀 Custom cookie isolation patch dedicated ONLY to Firefox
    {
      name: "firefox",
      use: {
        browserName: "firefox",
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
