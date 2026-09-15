import { defineConfig } from "@playwright/test";

const PORT = 3100;

const CRON_E2E_SECRET = process.env.CRON_E2E_SECRET ?? "playwright-test-secret";

// Explicit allowlist for the webServer environment — no process.env spread.
// Only include defined values so `next start` still falls back to .env file
// for missing keys. NODE_ENV is intentionally unset.
const webServerEnv: Record<string, string> = {
  CRON_SECRET: CRON_E2E_SECRET,
};
for (const key of [
  "DATABASE_URL",
  "APP_BASE_URL",
  "SESSION_SECRET",
  "YO_API_USERNAME",
  "YO_API_PASSWORD",
  "YO_API_MODE",
] as const) {
  const value = process.env[key];
  if (value !== undefined) webServerEnv[key] = value;
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  webServer: {
    command: `bunx next start -p ${PORT}`,
    // Health check only — /api/health returns {ok:true} with no DB/env
    // access, so readiness never depends on seed data or secrets.
    url: `http://127.0.0.1:${PORT}/api/health`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: webServerEnv,
  },
  projects: [
    {
      name: "api",
      testMatch: /.*\.api\.spec\.ts/,
    },
    {
      name: "ui",
      testMatch: /.*\.ui\.spec\.ts/,
      use: { browserName: "chromium" },
    },
  ],
});
