import { test as setup, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Establishes the admin session ONCE and saves it to a storage-state file the
 * authed suite reuses.
 *
 * Two modes:
 *  - Token injection (preferred for the seeded admin, which has no password):
 *    if `e2e/.auth/admin-token.txt` exists, inject it into the token store's
 *    localStorage keys. Use `scripts/mint-test-jwt.ts` (server) to produce it.
 *  - Password login: else use E2E_ADMIN_EMAIL/PASSWORD via the /login form.
 *
 * Self-skips if neither is available.
 */
export const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");
const TOKEN_FILE = path.join(__dirname, ".auth", "admin-token.txt");

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

// Token-store keys (see lib/auth/token-store.ts).
const ACCESS_KEY = "incacook.admin.access_token";
const REFRESH_KEY = "incacook.admin.refresh_token";
const EXPIRES_KEY = "incacook.admin.expires_at";

setup("authenticate admin", async ({ page }) => {
  const hasToken = existsSync(TOKEN_FILE);
  setup.skip(
    !hasToken && !(EMAIL && PASSWORD),
    "Provide e2e/.auth/admin-token.txt or E2E_ADMIN_EMAIL/PASSWORD.",
  );

  if (hasToken) {
    const token = readFileSync(TOKEN_FILE, "utf8").trim();
    await page.goto("/login");
    await page.evaluate(
      ({ token, ACCESS_KEY, REFRESH_KEY, EXPIRES_KEY }) => {
        localStorage.setItem(ACCESS_KEY, token);
        localStorage.setItem(REFRESH_KEY, token); // valid token → refresh never fires
        localStorage.setItem(EXPIRES_KEY, String(Math.floor(Date.now() / 1000) + 86_400));
      },
      { token, ACCESS_KEY, REFRESH_KEY, EXPIRES_KEY },
    );
    // Confirm the injected session resolves to an admin (dashboard renders).
    await page.goto("/");
    await expect(page.getByRole("link", { name: /utilisateurs/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.context().storageState({ path: ADMIN_STATE });
    return;
  }

  // Password-login fallback.
  await page.goto("/login");
  const submit = page.locator('button[type="submit"]');
  await expect(async () => {
    await page.locator("#email").fill(EMAIL!);
    await page.locator("#password").fill(PASSWORD!);
    expect(await submit.isEnabled()).toBe(true);
  }).toPass({ timeout: 20_000 });
  await submit.click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  await expect(page.getByRole("link", { name: /utilisateurs/i })).toBeVisible({
    timeout: 30_000,
  });
  await page.context().storageState({ path: ADMIN_STATE });
});
