import { test, expect } from "@playwright/test";

/**
 * Webhook contract tests — forged and malformed callbacks must never
 * settle anything. All cases below are read-only (no DB writes):
 * unknown refs return OK without writes; bad signatures return 400.
 */
test.describe("Yo! success IPN", () => {
  test("rejects an empty form with 400", async ({ request }) => {
    const res = await request.post("/api/webhooks/yo/success", {
      form: {},
    });
    expect(res.status()).toBe(400);
  });

  test("rejects a forged callback with 400 NOT VERIFIED", async ({
    request,
  }) => {
    const res = await request.post("/api/webhooks/yo/success", {
      form: {
        date_time: "2026-09-14 10:00:00",
        amount: "11000",
        narrative: "Wallet top-up",
        network_ref: "NET-1",
        external_ref: "TX_FORGED001",
        msisdn: "256777123456",
        signature: "forged-signature",
      },
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("NOT VERIFIED");
  });

  test("rejects a non-form body with 400", async ({ request }) => {
    const res = await request.post("/api/webhooks/yo/success", {
      headers: { "content-type": "text/plain" },
      data: "not-a-form",
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Yo! failure IPN", () => {
  test("rejects an empty form with 400", async ({ request }) => {
    const res = await request.post("/api/webhooks/yo/failure", {
      form: {},
    });
    expect(res.status()).toBe(400);
  });

  test("rejects a forged callback with 400 NOT VERIFIED", async ({
    request,
  }) => {
    const res = await request.post("/api/webhooks/yo/failure", {
      form: {
        failed_transaction_reference: "TX_FORGED002",
        transaction_init_date: "2026-09-14 10:00:00",
        verification: "forged-verification",
      },
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("NOT VERIFIED");
  });
});
