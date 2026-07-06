import { test, expect } from "@playwright/test";

/**
 * Backend-free smoke suite — verifies TASK-002's client-side auth gate and the
 * login page in a real browser. No IncaCook-Server needed: an unauthenticated
 * visitor has no session token, so `AuthGuard` must bounce every protected
 * route to /login, and a signin attempt against an unreachable API must fail
 * gracefully (inline error, no crash).
 */

const PROTECTED_ROUTES = ["/", "/users", "/sellers", "/orders", "/listings", "/reports", "/geography", "/kyc", "/disputes"];

test.describe("auth gate (no backend)", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`unauthenticated ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    });
  }

  test("login page renders the form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Administration IncaCook")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("signin against an unreachable API surfaces an inline error, no crash", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("nobody@example.com");
    await page.locator("#password").fill("whatever123");
    await page.locator('button[type="submit"]').click();
    // The form must not navigate away and must surface an inline error (the
    // login page renders ApiError.message in a role="alert"), without crashing.
    await expect(page).toHaveURL(/\/login$/);
    const alert = page.getByRole("alert").filter({ hasText: /\S/ }).first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
  });
});
