import "server-only";
import { YoAPI, type YoMode } from "@herberthtk/yo-payments-api";
import { INTERACTIVE_TIMEOUT_MS, CRON_TIMEOUT_MS } from "./constants";

const getCredentials = () => {
  const username = process.env.YO_API_USERNAME;
  const password = process.env.YO_API_PASSWORD;
  const mode = (process.env.YO_API_MODE ?? "production") as YoMode;
  if (!username || !password) {
    throw new Error("Set YO_API_USERNAME and YO_API_PASSWORD.");
  }
  if (mode !== "sandbox" && mode !== "production") {
    throw new Error('YO_API_MODE must be "sandbox" or "production".');
  }
  return { username, password, mode };
}

/**
 * Fresh YoAPI client per request. YoAPI holds per-request state
 * (externalReference, nonce, nonBlocking, …) — never share instances
 * across requests.
 */
export const getYoClient = (opts?: { timeoutMs?: number }): YoAPI => {
  const { username, password, mode } = getCredentials();
  const api = new YoAPI(username, password, mode);
  api.setTimeout(opts?.timeoutMs ?? INTERACTIVE_TIMEOUT_MS);
  return api;
}

/** Fresh client with the longer timeout suited to cron reconciliation. */
export const getYoCronClient = (): YoAPI => {
  return getYoClient({ timeoutMs: CRON_TIMEOUT_MS });
}

export const getYoWebhookUrls = (): {
  success: string;
  failure: string;
} =>{
  const base = process.env.APP_BASE_URL;
  if (!base) throw new Error("Set APP_BASE_URL.");
  if (!base.startsWith("https://")) {
    throw new Error("APP_BASE_URL must use https:// in production.");
  }
  return {
    success: `${base}/api/webhooks/yo/success`,
    failure: `${base}/api/webhooks/yo/failure`,
  };
}

/**
 * Per-request deposit configuration. Call on a fresh client immediately
 * before acDepositFunds — never persist these on a shared instance.
 */
export const configureDepositRequest = (api: YoAPI, externalRef: string) =>{
  const { success, failure } = getYoWebhookUrls();
  api.setExternalReference(externalRef);
  api.setNonblocking("TRUE");
  api.setInstantNotificationUrl(success);
  api.setFailureNotificationUrl(failure);
}

/**
 * SDK inserts values into request XML verbatim — escape narratives
 * (and any user-derived text) before sending.
 */
export const sanitizeXmlText = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const baseUrl = process.env.APP_BASE_URL;
const username = process.env.YO_API_USERNAME;
const password = process.env.YO_API_PASSWORD;
const mode = (process.env.YO_API_MODE ?? "production") as YoMode;
if (!username || !password) {
  throw new Error("Set YO_API_USERNAME and YO_API_PASSWORD.");
}
if (mode !== "sandbox" && mode !== "production") {
    throw new Error('YO_API_MODE must be "sandbox" or "production".');
}
if(!baseUrl || !baseUrl.startsWith("https://")){
  throw new Error("APP_BASE_URL must start with https:// in production.");
}

export const yoAPI = new YoAPI(username, password, mode);
yoAPI.setNonblocking('TRUE');
yoAPI.setInstantNotificationUrl(`${baseUrl}/api/webhooks/yo/success`);
yoAPI.setFailureNotificationUrl(`${baseUrl}/api/webhooks/yo/failure`);