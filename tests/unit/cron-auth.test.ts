import { cronSecretRequired, isCronAuthorized } from "@/lib/yo/cron-auth";
import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
});

const authedRequest = (header: string | null) =>
  new Request("http://localhost/api/cron/yo-reconcile", {
    headers: header ? { authorization: header } : {},
  });

const rawHeaderRequest = (header: string) =>
  ({ headers: { get: () => header } }) as unknown as Request;

describe("isCronAuthorized", () => {
  it("accepts the exact bearer secret", () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    expect(isCronAuthorized(authedRequest("Bearer s3cr3t"))).toBe(true);
  });

  it("rejects wrong, missing and malformed credentials", () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    expect(isCronAuthorized(authedRequest("Bearer wrong"))).toBe(false);
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
    expect(isCronAuthorized(authedRequest("s3cr3t"))).toBe(false);
    expect(isCronAuthorized(authedRequest("bearer s3cr3t"))).toBe(false);
  });

  it("compares in constant time (length gate first)", () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    expect(isCronAuthorized(authedRequest("Bearer s3cr3tx"))).toBe(false);
    expect(isCronAuthorized(authedRequest("Bearer s3cr"))).toBe(false);
  });

  it("rejects a bearer token with a trailing space", () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    // NOTE: the Fetch Headers layer strips OWS, so a real Request can never
    // deliver the trailing space — stub headers to unit-test the comparison.
    expect(isCronAuthorized(rawHeaderRequest("Bearer s3cr3t "))).toBe(false);
  });

  it("never matches a whitespace-only secret for unauthenticated calls", () => {
    vi.stubEnv("CRON_SECRET", "   ");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
    expect(isCronAuthorized(authedRequest("Bearer wrong"))).toBe(false);
  });

  it("trims trailing whitespace from the secret (common .env mishap)", () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t  ");
    expect(isCronAuthorized(authedRequest("Bearer s3cr3t"))).toBe(true);
    expect(isCronAuthorized(rawHeaderRequest("Bearer s3cr3t  "))).toBe(false);
  });

  it("denies unauthenticated calls without the explicit opt-in", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
    vi.stubEnv("NODE_ENV", "production");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
  });

  it("allows unauthenticated calls with the flag in non-production", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "true");
    vi.stubEnv("NODE_ENV", "development");
    expect(isCronAuthorized(authedRequest(null))).toBe(true);
  });

  it("denies unauthenticated calls with the flag in production (fail closed)", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "true");
    vi.stubEnv("NODE_ENV", "production");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
  });

  it("denies truthy-but-inexact flag values (TRUE, 1) even in non-production", () => {
    // The opt-in is an exact === "true" match — case variants and "1"
    // must not open the endpoint.
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "TRUE");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
    vi.stubEnv("ALLOW_UNAUTH_CRON", "1");
    expect(isCronAuthorized(authedRequest(null))).toBe(false);
  });
});

describe("cronSecretRequired", () => {
  it("requires the secret when unset without the opt-in", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(cronSecretRequired()).toBe(true);
    vi.stubEnv("NODE_ENV", "development");
    expect(cronSecretRequired()).toBe(true);
  });

  it("does not require it when set", () => {
    vi.stubEnv("CRON_SECRET", "x");
    vi.stubEnv("NODE_ENV", "production");
    expect(cronSecretRequired()).toBe(false);
  });

  it("does not require it with the opt-in flag in non-production", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "true");
    vi.stubEnv("NODE_ENV", "development");
    expect(cronSecretRequired()).toBe(false);
  });

  it("still requires it with the opt-in flag in production (fail closed)", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "true");
    vi.stubEnv("NODE_ENV", "production");
    expect(cronSecretRequired()).toBe(true);
  });

  it("still requires it for inexact flag values (TRUE, 1) in non-production", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOW_UNAUTH_CRON", "TRUE");
    expect(cronSecretRequired()).toBe(true);
    vi.stubEnv("ALLOW_UNAUTH_CRON", "1");
    expect(cronSecretRequired()).toBe(true);
  });
});
