// Shared Yo! top-up tuning — pure module, safe for Client Components,
// Server Actions and Route Handlers. Change polling/reconcile behavior here.

/** Min/max top-up amount in UGX (integer). */
export const MIN_TOPUP = 1000;
export const MAX_TOPUP = 5_000_000;

/** Abuse guard: max PENDING/INDETERMINATE deposits per user per window. */
export const MAX_PENDING_DEPOSITS = 5;
export const RATE_LIMIT_WINDOW_MINUTES = 10;

/** Client confirmation window before handing over to IPN/cron + 24h follow-up. */
export const POLL_DEADLINE_MS = 180_000;
export const POLL_START_DELAY_MS = 8_000;
export const POLL_MAX_DELAY_MS = 20_000;
export const POLL_BACKOFF = 1.4;

/** Reconciliation worker (scheduler calls the endpoint every 6 minutes). */
export const STALE_MINUTES = 6;
export const RECONCILE_BATCH_SIZE = 5;

/** Max parallel provider status checks per cron loop (maxDuration=60 bound). */
export const RECONCILE_CONCURRENCY = 3;

/** Orphaned PENDING rows with no provider confirmation expire after this long. */
export const EXPIRE_AFTER_HOURS = 24;

/** Gateway timeouts. */
export const INTERACTIVE_TIMEOUT_MS = 25_000;
export const STATUS_POLL_TIMEOUT_MS = 15_000;
export const CRON_TIMEOUT_MS = 10_000;

/** Jitter a delay by ±20% to avoid polling herds. */
export const withJitter = (delayMs: number): number =>
  Math.round(delayMs * (0.8 + Math.random() * 0.4));
