import { describe, expect, it, vi } from "vitest";
import { verifyMsisdnAction } from "@/lib/actions/msisdn";
import verifyNumber from "@/sdk/index";

vi.mock("@/sdk/index", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("verifyMsisdnAction", () => {
  it("rejects invalid format phone numbers", async () => {
    const res1 = await verifyMsisdnAction("12345");
    expect(res1.success).toBe(false);
    if (!res1.success) {
      expect(res1.message).toMatch(/valid Ugandan number/i);
    }

    const res2 = await verifyMsisdnAction("");
    expect(res2.success).toBe(false);
  });

  it("rejects unsupported providers (non-MTN/Airtel)", async () => {
    // 071... is UTL (unsupported for MoMo deposit prompt)
    const res = await verifyMsisdnAction("256711234567");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.message).toMatch(/MTN and Airtel/i);
    }
  });

  it("validates 256XXXXXXXXX format and returns verified name on success", async () => {
    const mockVerify = vi.mocked(verifyNumber.verify);
    mockVerify.mockResolvedValueOnce({
      response: "OK",
      data: {
        msisdn: "256779159642",
        FirstName: "HERBERT",
        Surname: "KAVUMA",
      },
    });

    const res = await verifyMsisdnAction("256779159642");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.name).toBe("HERBERT KAVUMA");
      expect(res.msisdn).toBe("256779159642");
      expect(res.provider).toBe("MTN");
    }
  });

  it("handles normalized national input 0779159642 to 256779159642", async () => {
    const mockVerify = vi.mocked(verifyNumber.verify);
    mockVerify.mockResolvedValueOnce({
      response: "OK",
      data: {
        msisdn: "256779159642",
        FirstName: "HERBERT",
        Surname: "KAVUMA",
      },
    });

    const res = await verifyMsisdnAction("0779159642");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.name).toBe("HERBERT KAVUMA");
      expect(res.msisdn).toBe("256779159642");
      expect(res.provider).toBe("MTN");
    }
  });

  it("returns clean error message when network returns failure", async () => {
    const mockVerify = vi.mocked(verifyNumber.verify);
    mockVerify.mockResolvedValueOnce({
      response: "ERROR",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: null as any,
      message: "Subscriber not found",
    });

    const res = await verifyMsisdnAction("256779159642");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.message).toMatch(/Subscriber not found/i);
    }
  });
});
