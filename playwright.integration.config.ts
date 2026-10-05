import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/integration",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    // Do not record fixture bearer/session data in traces or screenshots.
    trace: "off",
    screenshot: "off",
  },
  webServer: {
    command: "node scripts/integration-server.mjs",
    url: "http://127.0.0.1:3200",
    timeout: 120000,
    reuseExistingServer: false,
  },
});
