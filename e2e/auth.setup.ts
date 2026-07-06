import { test as setup, expect } from "@playwright/test";
import path from "node:path";

/**
 * Logs in ONCE as the admin and saves the session (localStorage tokens) to a
 * storage-state file the authed suite reuses — so individual tests don't each
 * re-run a hydration-sensitive login. Self-skips without creds.
 */
export const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

setup("authenticate admin", async ({ page }) => {
  setup.skip(!(EMAIL && PASSWORD), "Set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD.");

  await page.goto("/login");
  const submit = page.locator('button[type="submit"]');
  // Retry filling until React (post-hydration) registers the values and the
  // submit button enables — robust against fill-before-hydration.
  await expect(async () => {
    await page.locator("#email").fill(EMAIL!);
    await page.locator("#password").fill(PASSWORD!);
    expect(await submit.isEnabled()).toBe(true);
  }).toPass({ timeout: 20_000 });

  await submit.click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  // Sidebar link confirms we're inside the dashboard, not bounced back.
  await expect(page.getByRole("link", { name: /utilisateurs/i })).toBeVisible({
    timeout: 30_000,
  });

  await page.context().storageState({ path: ADMIN_STATE });
});
