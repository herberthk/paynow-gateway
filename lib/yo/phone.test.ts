import { describe, expect, it } from "vitest";
import {
  normalizeUgMsisdn,
  detectProvider,
  parseTopupMsisdn,
  formatUgDisplay,
  methodLabelFor,
} from "./phone";
import { withJitter } from "./constants";

describe("normalizeUgMsisdn", () => {
  it.each([
    ["0777123456", "256777123456"],
    ["0781234567", "256781234567"],
    ["0769876543", "256769876543"],
    ["0701123456", "256701123456"],
    ["0752123456", "256752123456"],
    ["0743123456", "256743123456"],
    ["256777123456", "256777123456"],
    ["+256751123456", "256751123456"],
    ["0777 123 456", "256777123456"],
    ["0777-123-456", "256777123456"],
    ["(0777) 123 456", "256777123456"],
    ["0777.123.456", "256777123456"],
    ["771234567", "256771234567"],
  ])("normalizes %s", (input, expected) => {
    const result = normalizeUgMsisdn(input);
    expect(result).toEqual({ ok: true, msisdn: expected });
  });

  it("rejects the 00256 international-dial prefix", () => {
    expect(normalizeUgMsisdn("00256777123456").ok).toBe(false);
  });

  it("rejects non-string input via the required guard", () => {
    expect(
      normalizeUgMsisdn(256777123456 as unknown as string).ok,
    ).toBe(false);
    expect(normalizeUgMsisdn(null as unknown as string).ok).toBe(false);
    expect(normalizeUgMsisdn(undefined as unknown as string).ok).toBe(false);
  });

  it.each([
    ["", "empty"],
    ["123", "too short"],
    ["07771234567", "too long"],
    ["07abc12345", "non-digits"],
    ["+15551234567", "non-Ugandan"],
  ])("rejects %s", (input) => {
    expect(normalizeUgMsisdn(input).ok).toBe(false);
  });
});

describe("detectProvider", () => {
  it.each([
    ["256777123456", "MTN"],
    ["256781234567", "MTN"],
    ["256769876543", "MTN"],
    ["256701123456", "AIRTEL"],
    ["256752123456", "AIRTEL"],
    ["256743123456", "AIRTEL"],
  ])("%s → %s", (msisdn, provider) => {
    expect(detectProvider(msisdn)).toBe(provider);
  });

  it.each([
    "256791234567", // defunct Africell
    "256711234567", // UTL
    "256311234567", // fixed line — cannot approve a PIN prompt
    "256391234567",
    "256201234567",
  ])("returns null for unsupported %s", (msisdn) => {
    expect(detectProvider(msisdn)).toBeNull();
  });

  it("returns null for non-normalized input (callers must normalize first)", () => {
    // National format without the 256 prefix yields prefix "07" → unsupported.
    expect(detectProvider("0777123456")).toBeNull();
  });
});

describe("parseTopupMsisdn", () => {
  it("accepts MTN and Airtel in any supported format", () => {
    expect(parseTopupMsisdn("0777123456")).toEqual({
      ok: true,
      msisdn: "256777123456",
      provider: "MTN",
    });
    expect(parseTopupMsisdn("+256752123456")).toEqual({
      ok: true,
      msisdn: "256752123456",
      provider: "AIRTEL",
    });
  });

  it("rejects unsupported networks with a clear message", () => {
    const result = parseTopupMsisdn("0712123456");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/MTN and Airtel/i);
    }
  });

  it("rejects malformed input", () => {
    expect(parseTopupMsisdn("123").ok).toBe(false);
  });
});

describe("formatUgDisplay", () => {
  it("formats international to national display", () => {
    expect(formatUgDisplay("256777123456")).toBe("0777 123 456");
  });

  it("passes through unexpected shapes untouched", () => {
    expect(formatUgDisplay("0777123456")).toBe("0777 123 456");
    expect(formatUgDisplay("garbage")).toBe("garbage");
    expect(formatUgDisplay("")).toBe("");
  });
});

describe("methodLabelFor", () => {
  it("maps providers to method labels", () => {
    expect(methodLabelFor("MTN")).toBe("MTN Mobile Money");
    expect(methodLabelFor("AIRTEL")).toBe("Airtel Mobile Money");
  });
});

describe("withJitter", () => {
  it("stays within ±20% of the base delay", () => {
    for (let i = 0; i < 200; i += 1) {
      const jittered = withJitter(10_000);
      expect(jittered).toBeGreaterThanOrEqual(8_000);
      expect(jittered).toBeLessThanOrEqual(12_000);
      expect(Number.isInteger(jittered)).toBe(true);
    }
  });
});
