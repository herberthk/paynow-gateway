import "server-only";
import { getYoClient } from "@/lib/yo/client";
import { finalizeYoSuccess } from "@/lib/actions/yo";
import { parseYoForm, toPaymentBody } from "../_utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Yo! Payments success IPN. Neither callback carries the gateway
 * TransactionReference — success echoes YOUR ExternalReference as
 * `external_ref`, so we correlate on that.
 */
export async function POST(req: Request) {
  // Body-size guard before formData parsing: absent header = proceed.
  const contentLength = req.headers.get("content-length");
  if (contentLength != null) {
    const parsedLength = Number.parseInt(contentLength, 10);
    if (Number.isFinite(parsedLength) && parsedLength > 1_000_000) {
      return new Response("PAYLOAD TOO LARGE", { status: 413 });
    }
  }
  const raw = await parseYoForm(req);
  if (!raw) return new Response("BAD REQUEST", { status: 400 });

  let result: {
    is_verified: boolean;
    external_ref: string;
    amount: string;
    network_ref: string;
    msisdn: string;
  };
  try {
    result = getYoClient().receivePaymentNotification(toPaymentBody(raw));
  } catch (error) {
    console.error("yo success ipn verify threw", { error });
    return new Response("RETRY", { status: 500 });
  }
  if (!result.is_verified) {
    console.warn("yo success ipn NOT VERIFIED", {
      external_ref: raw.external_ref,
    });
    return new Response("NOT VERIFIED", { status: 400 });
  }
  if (!result.external_ref) {
    return new Response("NO REF", { status: 400 });
  }

  try {
    const settled = await finalizeYoSuccess({
      externalRef: result.external_ref,
      gatewayAmount: result.amount,
      gatewayMsisdn: result.msisdn,
      networkRef: result.network_ref,
    });
    if (!settled.applied && settled.reason === "unknown-ref") {
      // Keep OK so the gateway stops retrying, but stay visible: a real
      // payment without a local record needs manual reconciliation.
      console.warn("yo success ipn unknown ref", {
        external_ref: result.external_ref,
      });
    }
  } catch (error) {
    console.error("yo success ipn settle failed", {
      external_ref: result.external_ref,
      error,
    });
    return new Response("RETRY", { status: 500 });
  }
  return new Response("OK");
}
