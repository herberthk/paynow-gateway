// Pure Uganda MSISDN helpers — no server dependencies, safe to import
// from Client Components (e.g. live provider badge) and Server Actions.

export type MobileMoneyProviderName = "MTN" | "AIRTEL";

/**
 * Network prefix map (national format after the 256 country code).
 * Mobile ranges only — fixed-line ranges (031/039/020) and defunct ranges
 * (e.g. 079 Africell, 071 UTL) map to null because they cannot approve a
 * mobile-money PIN prompt; the user gets a clear "unsupported network"
 * error instead of a stuck PENDING deposit.
 */
const MTN_PREFIXES = new Set(["77", "78", "76"]);
const AIRTEL_PREFIXES = new Set(["70", "75", "74"]);

export type NormalizeResult =
  | { ok: true; msisdn: string }
  | { ok: false; error: string };

/**
 * Normalize Ugandan phone input to Yo! format `256XXXXXXXXX`.
 * Accepts: 07XXXXXXXX, 256XXXXXXXX, +256XXXXXXXX, with spaces/dashes.
 */
export function normalizeUgMsisdn(input: string): NormalizeResult {
  if (!input || typeof input !== "string") {
    return { ok: false, error: "Phone number is required" };
  }
  let digits = input.trim().replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) {
    return { ok: false, error: "Phone number must contain digits only" };
  }
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `256${digits.slice(1)}`;
  } else if (digits.startsWith("256") && digits.length === 12) {
    // already international
  } else if (/^7\d{8}$/.test(digits)) {
    digits = `256${digits}`;
  } else {
    return {
      ok: false,
      error: "Enter a valid Ugandan number e.g. 0777123456",
    };
  }
  if (!/^256\d{9}$/.test(digits)) {
    return {
      ok: false,
      error: "Enter a valid Ugandan number e.g. 0777123456",
    };
  }
  return { ok: true, msisdn: digits };
}

/** Detect MTN/AIRTEL from a normalized `256…` MSISDN. Null = unsupported. */
export function detectProvider(
  msisdn256: string,
): MobileMoneyProviderName | null {
  const national = msisdn256.startsWith("256")
    ? msisdn256.slice(3)
    : msisdn256;
  const prefix = national.slice(0, 2);
  if (MTN_PREFIXES.has(prefix)) return "MTN";
  if (AIRTEL_PREFIXES.has(prefix)) return "AIRTEL";
  return null;
}

/** Validate + normalize + detect in one step (server-action friendly). */
export function parseTopupMsisdn(input: string):
  | { ok: true; msisdn: string; provider: MobileMoneyProviderName }
  | { ok: false; error: string } {
  const normalized = normalizeUgMsisdn(input);
  if (!normalized.ok) return normalized;
  const provider = detectProvider(normalized.msisdn);
  if (!provider) {
    return {
      ok: false,
      error:
        "Only MTN and Airtel Uganda numbers are supported for top-up",
    };
  }
  return { ok: true, msisdn: normalized.msisdn, provider };
}

/** Display label used for Transaction.method / wallet reason. */
export const methodLabelFor = (provider: MobileMoneyProviderName): string =>
  provider === "MTN" ? "MTN Mobile Money" : "Airtel Mobile Money";

/** Display format: 256777123456 → 0777 123 456 */
export function formatUgDisplay(msisdn256: string): string {
  const national = msisdn256.startsWith("256")
    ? `0${msisdn256.slice(3)}`
    : msisdn256;
  if (national.length !== 10) return msisdn256;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
}
