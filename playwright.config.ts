import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local into process.env (E2E_* creds + API base) so `pnpm e2e`
// works without exporting them. No dependency; existing env wins.
const envLocal = resolve(process.cwd(), ".env.local");
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

/**
 * Playwright E2E config for the IncaCook admin panel.
 *
 * `webServer` auto-starts `next dev` on :3100 and waits for it before running.
 * Browsers are reused from the machine's Playwright cache (no download).
 *
 * The default smoke suite (e2e/auth-gate.spec.ts) needs NO backend — it
 * verifies TASK-002's client route guard + login page. Authed suites that need
 * a live backend read E2E_API_BASE_URL / E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 * and skip themselves when those are absent.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Unauthed specs (auth gate, live non-admin) — no saved session.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/auth\.setup\.ts/, /authed\.spec\.ts/],
    },
    // Log in once, save session.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // Authed dashboard flows — reuse the saved session. Run serially: a single
    // `next start` dev server + one backend flakes under many concurrent page
    // loads (route-chunk / cold-DB 500s), so parallel here is a false negative.
    {
      name: "authed",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /authed\.spec\.ts/,
      fullyParallel: false,
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Point the app at whatever backend the E2E run targets (unset = the
    // app's own default; a down/unreachable API just exercises error paths).
    env: process.env.E2E_API_BASE_URL
      ? { NEXT_PUBLIC_API_BASE_URL: process.env.E2E_API_BASE_URL }
      : {},
  },
});
