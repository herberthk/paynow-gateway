import crypto from "crypto";

// Pure cron authorization — no server-only marker so unit tests can import it.

/** Fail-closed: secret required unless explicit ALLOW_UNAUTH_CRON opt-in. */
function allowUnauthCron(): boolean {
  // The bypass flag never works in production — fail closed there even
  // when ALLOW_UNAUTH_CRON === "true".
  return (
    process.env.ALLOW_UNAUTH_CRON === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

export function cronSecretRequired(): boolean {
  return !process.env.CRON_SECRET && !allowUnauthCron();
}

export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Scheduler secret not configured — fail closed. Allow unauthenticated
    // access only when ALLOW_UNAUTH_CRON === "true" in non-production.
    // In production the flag is ignored (fail closed).
    return allowUnauthCron();
  }
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
