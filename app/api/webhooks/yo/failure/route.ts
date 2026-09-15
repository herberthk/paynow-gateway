import "server-only";
import { getYoClient } from "@/lib/yo/client";
import { finalizeYoFailure } from "@/lib/actions/yo";
import { parseYoForm, toFailureBody, PayloadTooLargeError } from "../_utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Yo! Payments failure IPN. Correlates on YOUR ExternalReference echoed
 * back as `failed_transaction_reference` (no gateway ref, no amount).
 */
export async function POST(req: Request) {
  let raw: Record<string, string> | null;
  try {
    raw = await parseYoForm(req);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return new Response("PAYLOAD TOO LARGE", { status: 413 });
    }
    return new Response("BAD REQUEST", { status: 400 });
  }
  if (!raw) return new Response("BAD REQUEST", { status: 400 });

  let result: {
    is_verified: boolean;
    failed_transaction_reference: string;
  };
  try {
    result = getYoClient().receivePaymentFailureNotification(
      toFailureBody(raw),
    );
  } catch (error) {
    console.error("yo failure ipn verify threw", { error });
    return new Response("RETRY", { status: 500 });
  }
  if (!result.is_verified) {
    console.warn("yo failure ipn NOT VERIFIED", {
      failed_transaction_reference: raw.failed_transaction_reference,
    });
    return new Response("NOT VERIFIED", { status: 400 });
  }
  if (!result.failed_transaction_reference) {
    return new Response("NO REF", { status: 400 });
  }

  try {
    const settled = await finalizeYoFailure(
      result.failed_transaction_reference,
    );
    if (!settled.applied && settled.reason === "unknown-ref") {
      console.warn("yo failure ipn unknown ref", {
        failed_transaction_reference: result.failed_transaction_reference,
      });
    }
  } catch (error) {
    console.error("yo failure ipn settle failed", {
      failed_transaction_reference: result.failed_transaction_reference,
      error,
    });
    return new Response("RETRY", { status: 500 });
  }
  return new Response("OK");
}
