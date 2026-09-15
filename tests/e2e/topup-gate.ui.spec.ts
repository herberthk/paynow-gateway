import { test, expect } from "@playwright/test";

/**
 * Auth-gate specs for the top-up surface. Authenticated purchase flows
 * are covered at the action level (initiate requires a session and never
 * moves money before gateway confirmation); these specs pin the gate
 * itself without needing browsers seeded with user credentials.
 *
 * Landing page is app/(auth)/page.tsx (route "/"): stable copy is the
 * "Sign In" heading, the "Email Address" label and the "Send OTP" button.
 */
test.describe("top-up auth gate", () => {
  test("unauthenticated visitors are redirected to /", async ({ page }) => {
    await page.goto("/dashboard/user/wallet/topup");
    // Next redirect surfaces as a navigation to the landing page.
    // Exact-URL + visible-content assertions: redirect status codes
    // vary by Next version, so res?.status() is intentionally avoided.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByText("Email Address")).toBeVisible();
  });

  test("unauthenticated deep links to the receipt page are gated too", async ({
    page,
  }) => {
    // The dashboard layout redirects before the page ever loads a receipt.
    await page.goto("/dashboard/user/wallet/topup/success?ref=TX_NOPE");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByRole("button", { name: /send otp/i })).toBeVisible();
  });
});
