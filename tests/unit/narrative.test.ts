import { buildTopupNarrative } from "@/lib/yo/narrative";
import { describe, expect, it } from "vitest";

describe("buildTopupNarrative", () => {
  it("strips XML-significant characters", () => {
    expect(buildTopupNarrative('<Alice>&"Bob\'')).toBe("Wallet top-up AliceBob");
  });

  it("collapses whitespace and trims", () => {
    expect(buildTopupNarrative("  Alice   \n  Smith  ")).toBe(
      "Wallet top-up Alice Smith",
    );
  });

  it("caps the narrative at 60 characters", () => {
    const long = "A".repeat(100);
    const result = buildTopupNarrative(long);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toBe(`Wallet top-up ${"A".repeat(60 - "Wallet top-up ".length)}`);
  });

  it("keeps an exactly-60-character narrative intact (boundary)", () => {
    // "Wallet top-up " is 14 chars, so a 46-char name lands on exactly 60.
    const result = buildTopupNarrative("A".repeat(46));
    expect(result).toBe(`Wallet top-up ${"A".repeat(46)}`);
    expect(result.length).toBe(60);
    // One char more still caps at 60.
    expect(buildTopupNarrative("A".repeat(47)).length).toBe(60);
  });

  it("falls back when stripping leaves nothing", () => {
    expect(buildTopupNarrative(`<>&"'`)).toBe("Wallet top-up");
  });

  it("falls back for empty, blank and nullish names", () => {
    expect(buildTopupNarrative("")).toBe("Wallet top-up");
    expect(buildTopupNarrative("   ")).toBe("Wallet top-up");
    expect(buildTopupNarrative(null)).toBe("Wallet top-up");
    expect(buildTopupNarrative(undefined)).toBe("Wallet top-up");
  });

  it("strips XML-illegal / header-risk control characters", () => {
    expect(buildTopupNarrative("Alice\x00\x07\x0b\x0c\x0e\x1fBob")).toBe(
      "Wallet top-up AliceBob",
    );
    // \t \n \r are whitespace, not stripped -- collapsed to a space.
    expect(buildTopupNarrative("Alice\t\nSmith")).toBe(
      "Wallet top-up Alice Smith",
    );
  });

  it("falls back when only control chars remain after stripping", () => {
    expect(buildTopupNarrative("\x00\x07\x0b\x0c\x0e\x1f")).toBe(
      "Wallet top-up",
    );
  });
});
