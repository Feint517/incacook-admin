import { test, expect } from "@playwright/test";

/**
 * Live-backend verification that needs NO admin role and NO DB mutation.
 * Confirms the admin app talks to the real IncaCook backend end-to-end:
 *  - a valid NON-admin account signs in for real, and the admin role-gate
 *    rejects it with "Accès non autorisé" (TASK-002, against live data);
 *  - a wrong password surfaces the real backend error inline.
 *
 * Needs a reachable backend (built with NEXT_PUBLIC_API_BASE_URL = live) and:
 *   E2E_NONADMIN_EMAIL, E2E_NONADMIN_PASSWORD
 */
const EMAIL = process.env.E2E_NONADMIN_EMAIL;
const PASSWORD = process.env.E2E_NONADMIN_PASSWORD;
const HAS = !!(EMAIL && PASSWORD);

test.describe("live backend — non-admin auth", () => {
  test.skip(!HAS, "Set E2E_NONADMIN_EMAIL + E2E_NONADMIN_PASSWORD to run.");

  test("valid non-admin login is rejected by the admin gate", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(EMAIL!);
    await page.locator("#password").fill(PASSWORD!);
    await page.locator('button[type="submit"]').click();
    // Real signin succeeds, /users/me returns role=BUYER, gate rejects.
    await expect(
      page.getByText(/non autoris|droits d'administration/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("wrong password surfaces the real backend error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(EMAIL!);
    await page.locator("#password").fill("definitely-wrong-000");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("alert").filter({ hasText: /\S/ }).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
