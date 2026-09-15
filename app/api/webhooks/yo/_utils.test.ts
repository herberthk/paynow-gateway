import { describe, expect, it } from "vitest";
import { parseYoForm, toPaymentBody, toFailureBody, PayloadTooLargeError } from "./_utils";

const formRequest = (fields: Record<string, string>) => {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return new Request("http://localhost/api/webhooks/yo/success", {
    method: "POST",
    body: form,
  });
};

describe("parseYoForm", () => {
  it("keeps string fields", async () => {
    const parsed = await parseYoForm(
      formRequest({
        external_ref: "TX_ABC123",
        amount: "11000",
        signature: "sig",
      }),
    );
    expect(parsed).toMatchObject({
      external_ref: "TX_ABC123",
      amount: "11000",
      signature: "sig",
    });
  });

  it("drops File entries before verification", async () => {
    const form = new FormData();
    form.append("external_ref", "TX_ABC123");
    form.append("evil", new File(["x"], "x.txt", { type: "text/plain" }));
    const parsed = await parseYoForm(
      new Request("http://localhost/x", { method: "POST", body: form }),
    );
    expect(parsed).toEqual({ external_ref: "TX_ABC123" });
  });

  it("parses application/x-www-form-urlencoded bodies", async () => {
    const params = new URLSearchParams({
      external_ref: "TX_URLENC",
      amount: "7500",
      signature: "sig",
    });
    const parsed = await parseYoForm(
      new Request("http://localhost/x", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }),
    );
    expect(parsed).toMatchObject({
      external_ref: "TX_URLENC",
      amount: "7500",
      signature: "sig",
    });
  });

  it("parses urlencoded bodies with a charset content-type variant", async () => {
    const params = new URLSearchParams({
      external_ref: "TX_CHARSET",
      amount: "7500",
      signature: "sig",
    });
    const parsed = await parseYoForm(
      new Request("http://localhost/x", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: params.toString(),
      }),
    );
    expect(parsed).toMatchObject({
      external_ref: "TX_CHARSET",
      amount: "7500",
      signature: "sig",
    });
  });

  it("keeps the last value for duplicate keys (last-wins)", async () => {
    const form = new FormData();
    form.append("external_ref", "TX_FIRST");
    form.append("external_ref", "TX_LAST");
    const parsed = await parseYoForm(
      new Request("http://localhost/x", { method: "POST", body: form }),
    );
    expect(parsed).toMatchObject({ external_ref: "TX_LAST" });
  });

  it("drops a File under a verified key (NOT VERIFIED downstream)", async () => {
    // A File submitted as external_ref is dropped by parseYoForm, so the
    // key is absent and signature verification downstream sees the field
    // as missing — i.e. NOT VERIFIED — rather than trusting file content.
    const form = new FormData();
    form.append(
      "external_ref",
      new File(["TX_FILE"], "ref.txt", { type: "text/plain" }),
    );
    const parsed = await parseYoForm(
      new Request("http://localhost/x", { method: "POST", body: form }),
    );
    expect(parsed).not.toBeNull();
    expect(parsed).not.toHaveProperty("external_ref");
  });

  it("returns null for unparseable bodies", async () => {
    const parsed = await parseYoForm(
      new Request("http://localhost/x", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "not-a-form",
      }),
    );
    expect(parsed).toBeNull();
  });

  it("returns null for JSON bodies (form-only endpoint)", async () => {
    const parsed = await parseYoForm(
      new Request("http://localhost/x", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ external_ref: "TX_JSON" }),
      }),
    );
    expect(parsed).toBeNull();
  });

  it("returns null for GET requests with no content-type", async () => {
    const parsed = await parseYoForm(new Request("http://localhost/x"));
    expect(parsed).toBeNull();
  });

  it("throws PayloadTooLargeError if content-length exceeds limit", async () => {
    const req = new Request("http://localhost/x", {
      method: "POST",
      headers: { "content-length": "1000001" },
    });
    await expect(parseYoForm(req)).rejects.toThrow(PayloadTooLargeError);
  });

  it("throws PayloadTooLargeError if streamed chunked body exceeds limit", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(600_000));
        controller.enqueue(new Uint8Array(600_000));
        controller.close();
      },
    });
    const req = new Request("http://localhost/x", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: stream,
      // @ts-expect-error duplex required in node fetch
      duplex: "half",
    });
    await expect(parseYoForm(req)).rejects.toThrow(PayloadTooLargeError);
  });
});

describe("toPaymentBody", () => {
  it("maps fields and defaults missing ones to empty strings", () => {
    expect(
      toPaymentBody({ external_ref: "TX_1", amount: "5000" }),
    ).toEqual({
      date_time: "",
      amount: "5000",
      narrative: "",
      network_ref: "",
      external_ref: "TX_1",
      msisdn: "",
      signature: "",
    });
  });

  it("defaults every field to empty strings for an empty input", () => {
    expect(toPaymentBody({})).toEqual({
      date_time: "",
      amount: "",
      narrative: "",
      network_ref: "",
      external_ref: "",
      msisdn: "",
      signature: "",
    });
  });
});

describe("toFailureBody", () => {
  it("maps the three failure fields", () => {
    expect(
      toFailureBody({
        failed_transaction_reference: "TX_1",
        transaction_init_date: "2026-09-14 10:00:00",
        verification: "v",
        // Extra keys are dropped, not passed through.
        extra: "dropped",
      }),
    ).toEqual({
      failed_transaction_reference: "TX_1",
      transaction_init_date: "2026-09-14 10:00:00",
      verification: "v",
    });
  });
});
