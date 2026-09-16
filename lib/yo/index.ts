import "server-only";

// Per-request factory — do NOT export a shared instance. YoAPI holds
// per-request state (externalReference, nonce, nonBlocking, …).
export {
  getYoClient,
  getYoCronClient,
  getYoWebhookUrls,
  configureDepositRequest,
  sanitizeXmlText,
} from "./client";
export {
  normalizeUgMsisdn,
  detectProvider,
  parseTopupMsisdn,
  formatUgDisplay,
  methodLabelFor,
  type MobileMoneyProviderName,
} from "./phone";
export {
  MIN_TOPUP,
  MAX_TOPUP,
  MAX_PENDING_DEPOSITS,
  RATE_LIMIT_WINDOW_MINUTES,
  POLL_DEADLINE_MS,
  POLL_START_DELAY_MS,
  POLL_MAX_DELAY_MS,
  POLL_BACKOFF,
  STALE_MINUTES,
  RECONCILE_BATCH_SIZE,
  RECONCILE_CONCURRENCY,
  EXPIRE_AFTER_HOURS,
  INTERACTIVE_TIMEOUT_MS,
  STATUS_POLL_TIMEOUT_MS,
  CRON_TIMEOUT_MS,
  withJitter,
} from "./constants";
// export { buildTopupNarrative } from "./narrative";
