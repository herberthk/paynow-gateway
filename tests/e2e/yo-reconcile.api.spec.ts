import { test, expect } from "@playwright/test";

const CRON_E2E_SECRET =
  process.env.CRON_E2E_SECRET ?? "playwright-test-secret";

/**
 * Reconciler contract tests. The authorized run is read-only when no
 * stale deposits exist (expected counters are all zero, no writes).
 */
test.describe("Yo! reconcile endpoint", () => {
  test("rejects unauthenticated calls with 401", async ({ request }) => {
    const res = await request.post("/api/cron/yo-reconcile", {
      headers: { authorization: "" },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects a wrong secret with 401", async ({ request }) => {
    const res = await request.post("/api/cron/yo-reconcile", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    expect(res.status()).toBe(401);
  });

  test("authorized run returns a summary", async ({ request }) => {
    const res = await request.post("/api/cron/yo-reconcile", {
      headers: { authorization: `Bearer ${CRON_E2E_SECRET}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    for (const key of [
      "checked",
      "succeeded",
      "failed",
      "stillPending",
      "unknown",
      "errors",
    ]) {
      expect(typeof body[key]).toBe("number");
    }
  });
});
