import { defineConfig, devices } from "@playwright/test";

const port = 43149;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `npx next start --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
