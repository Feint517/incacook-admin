import { test, expect } from "@playwright/test";

/**
 * Authenticated end-to-end flows — REQUIRE a reachable backend + an
 * Admin/Moderator account. They self-skip unless all three env vars are set:
 *
 *   E2E_API_BASE_URL=https://…            # backend origin (app appends /v1)
 *   E2E_ADMIN_EMAIL=admin@…               # a seeded Admin/Moderator login
 *   E2E_ADMIN_PASSWORD=…
 *
 * Run:  E2E_API_BASE_URL=… E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm e2e authed
 *
 * (playwright.config passes E2E_API_BASE_URL into the dev/start webServer so the
 * app talks to that backend.)
 */
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HAS_CREDS = !!(EMAIL && PASSWORD && process.env.E2E_API_BASE_URL);

test.describe("authenticated admin flows", () => {
  test.skip(!HAS_CREDS, "Set E2E_API_BASE_URL + E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD to run.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(EMAIL!);
    await page.locator("#password").fill(PASSWORD!);
    await page.locator('button[type="submit"]').click();
    // Admin lands on the overview; a non-admin would stay/here-reject.
    await expect(page).toHaveURL(/\/$|\/$/, { timeout: 30_000 });
  });

  test("overview loads real KPIs (no perpetual skeleton, no error)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/chargement|loading/i)).toHaveCount(0, { timeout: 30_000 });
    // Sidebar nav is present once inside the dashboard.
    await expect(page.getByRole("link", { name: /utilisateurs/i })).toBeVisible();
  });

  test("users list renders rows from /v1/admin/users", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("table")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 30_000 });
  });

  test("KYC queue renders", async ({ page }) => {
    await page.goto("/kyc");
    await expect(page.locator("table, [data-empty], text=/aucun|no /i").first()).toBeVisible({ timeout: 30_000 });
  });

  test("disputes page renders", async ({ page }) => {
    await page.goto("/disputes");
    await expect(page.locator("table, [data-empty], text=/aucun|no /i").first()).toBeVisible({ timeout: 30_000 });
  });
});
