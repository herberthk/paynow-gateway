// NOTE: intentionally no `import "server-only"` — pure helpers shared with
// unit tests. The route handlers importing this file carry the marker.
import type {
  PaymentNotificationBody,
  PaymentFailureNotificationBody,
} from "@herberthtk/yo-payments-api";

/** Keep only string form fields — drop Files before verification. */
export async function parseYoForm(req: Request): Promise<Record<string, string> | null> {
  try {
    const form = await req.formData();
    const body: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") body[key] = value;
    }
    return body;
  } catch {
    return null;
  }
}

export function toPaymentBody(
  body: Record<string, string>,
): PaymentNotificationBody {
  return {
    date_time: body.date_time ?? "",
    amount: body.amount ?? "",
    narrative: body.narrative ?? "",
    network_ref: body.network_ref ?? "",
    external_ref: body.external_ref ?? "",
    msisdn: body.msisdn ?? "",
    signature: body.signature ?? "",
  };
}

export function toFailureBody(
  body: Record<string, string>,
): PaymentFailureNotificationBody {
  return {
    failed_transaction_reference: body.failed_transaction_reference ?? "",
    transaction_init_date: body.transaction_init_date ?? "",
    verification: body.verification ?? "",
  };
}
