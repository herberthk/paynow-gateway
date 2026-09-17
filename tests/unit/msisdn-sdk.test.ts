import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VerificationError, VerifyMsisdn } from "@/sdk/index";

describe("VerifyMsisdn transport errors", () => {
  beforeEach(() => {
    process.env.SSENTEZO_API_USER = "test-user";
    process.env.SSENTEZO_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [422, "upstream", 422],
    [503, "upstream", 503],
  ] as const)(
    "preserves HTTP %i as an upstream error",
    async (status, expectedKind, expectedStatus) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response(null, { status })),
      );

      const promise = new VerifyMsisdn().verify("256779159642");

      await expect(promise).rejects.toMatchObject<Partial<VerificationError>>({
        kind: expectedKind,
        status: expectedStatus,
      });
    },
  );

  it.each([
    [new DOMException("timed out", "TimeoutError"), "timeout"],
    [new TypeError("fetch failed"), "network"],
  ] as const)("classifies transport errors as %s", async (error, expectedKind) => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    const promise = new VerifyMsisdn().verify("256779159642");

    await expect(promise).rejects.toMatchObject<Partial<VerificationError>>({
      kind: expectedKind,
    });
  });
});
