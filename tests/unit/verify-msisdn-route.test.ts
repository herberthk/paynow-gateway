import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { verifyMsisdnAction } from "@/lib/actions/msisdn";
import type { VerifyMsisdnFailureType } from "@/lib/actions/msisdn";
import { POST } from "@/app/api/v1/wallet/verifyMsisdn/route";

vi.mock("@/lib/actions/msisdn", () => ({
  verifyMsisdnAction: vi.fn(),
}));

const request = () =>
  new NextRequest("http://localhost/api/v1/wallet/verifyMsisdn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn: "256779159642" }),
  });

describe("POST /api/v1/wallet/verifyMsisdn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["validation", 400],
    ["unsupported-provider", 400],
    ["verification", 400],
    ["upstream-4xx", 400],
    ["network", 503],
    ["timeout", 503],
    ["upstream-5xx", 502],
  ] satisfies ReadonlyArray<[VerifyMsisdnFailureType, number]>) (
    "maps %s failures to HTTP %i",
    async (failureType, expectedStatus) => {
      vi.mocked(verifyMsisdnAction).mockResolvedValueOnce({
        success: false,
        failureType,
        message: "Verification failed",
      });

      const response = await POST(request());

      expect(response.status).toBe(expectedStatus);
    },
  );
});
