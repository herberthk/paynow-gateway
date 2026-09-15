// NOTE: intentionally no `import "server-only"` — pure helpers shared with
// unit tests. The route handlers importing this file carry the marker.
import type {
  PaymentNotificationBody,
  PaymentFailureNotificationBody,
} from "@herberthtk/yo-payments-api";

export class PayloadTooLargeError extends Error {
  constructor(message = "Payload too large") {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

/** Keep only string form fields — drop Files before verification. */
export async function parseYoForm(
  req: Request,
  maxBytes = 1_000_000,
): Promise<Record<string, string> | null> {
  const contentLength = req.headers.get("content-length");
  if (contentLength != null) {
    const parsedLength = Number.parseInt(contentLength, 10);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      throw new PayloadTooLargeError();
    }
  }

  let requestToParse: Request = req;
  if (req.body && !req.bodyUsed) {
    const reader = req.body.getReader();
    let totalBytes = 0;
    const chunks: Uint8Array[] = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel();
          throw new PayloadTooLargeError();
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    requestToParse = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: merged,
    });
  }

  try {
    const form = await requestToParse.formData();
    const body: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") body[key] = value;
    }
    return body;
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      throw err;
    }
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
