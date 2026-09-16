import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import DepositEmail from "@/components/global/DepositEmail";

describe("DepositEmail", () => {
  it("USER_FAILURE greets userName with a Failed title", async () => {
    const html = await render(
      <DepositEmail role="USER_FAILURE" userName="Alice" amount={5000} />,
    );
    expect(html).toContain("Alice");
    expect(html).not.toContain("undefined");
    expect(html).toContain("Failed");
  });

  it("USER_CONFIRMATION greets userName with a success title", async () => {
    const html = await render(
      <DepositEmail role="USER_CONFIRMATION" userName="Bob" amount={10000} />,
    );
    expect(html).toContain("Bob");
    expect(html).toContain("Deposit Successful");
  });

  it("ADMIN_NOTICE greets adminName and shows the fee line", async () => {
    const html = await render(
      <DepositEmail
        role="ADMIN_NOTICE"
        adminName="Carol"
        userName="Dave"
        amount={20000}
        fee={500}
      />,
    );
    expect(html).toContain("Carol");
    expect(html).toContain("Dave");
    // Strip HTML comments inserted by @react-email/render between JSX nodes.
    expect(html.replace(/<!--[\s\S]*?-->/g, "")).toContain("UGX 500");
    expect(html).toContain("transaction fee");
    expect(html).not.toContain("undefined");
  });

  it("ADMIN_NOTICE falls back to 'a user' without a userName", async () => {
    const html = await render(
      <DepositEmail role="ADMIN_NOTICE" adminName="Carol" amount={20000} />,
    );
    expect(html).toContain("a user");
    expect(html).not.toContain("undefined");
  });

  it("renders the receipt link when receiptUrl is provided", async () => {
    const html = await render(
      <DepositEmail
        role="USER_CONFIRMATION"
        userName="Bob"
        amount={10000}
        method="Card (Stripe)"
        receiptUrl="https://pay.stripe.com/receipts/abc123"
      />,
    );
    expect(html).toContain("https://pay.stripe.com/receipts/abc123");
    expect(html).toContain("View Stripe Receipt");
  });

  it("labels a non-card receipt generically", async () => {
    const html = await render(
      <DepositEmail
        role="USER_CONFIRMATION"
        userName="Bob"
        amount={10000}
        method="MTN Mobile Money"
        receiptUrl="https://receipts.example.com/abc123"
      />,
    );
    expect(html).toContain("View receipt");
    expect(html).not.toContain("View Stripe Receipt");
  });

  it("does not render a non-https receipt link", async () => {
    const html = await render(
      <DepositEmail
        role="USER_CONFIRMATION"
        userName="Bob"
        amount={10000}
        receiptUrl="javascript:alert(1)"
      />,
    );
    expect(html).not.toContain("javascript:alert");
  });

  it("renders an empty reference without leaking 'undefined'", async () => {
    const html = await render(
      <DepositEmail role="USER_CONFIRMATION" userName="Bob" amount={10000} />,
    );
    expect(html).not.toContain("undefined");
  });

  it("USER_FAILURE without userName never leaks 'undefined'", async () => {
    const html = await render(
      <DepositEmail role="USER_FAILURE" amount={5000} />,
    );
    expect(html).not.toContain("undefined");
    expect(html).toContain("Failed");
  });

  it("defaults an omitted fee to zero", async () => {
    const html = await render(
      <DepositEmail role="USER_CONFIRMATION" userName="Bob" amount={10000} />,
    );
    expect(html).not.toContain("undefined");
    // @react-email/render inserts <!-- --> between JSX text nodes, so
    // "UGX 0" renders as "UGX<!-- --> <!-- -->0" — strip comments first.
    expect(html.replace(/<!--[\s\S]*?-->/g, "")).toContain("UGX 0");
  });

  it("renders currency=USD amounts in USD", async () => {
    const html = await render(
      <DepositEmail
        role="USER_CONFIRMATION"
        userName="Bob"
        amount={100}
        fee={2}
        currency="USD"
      />,
    );
    expect(html).toContain("USD");
    expect(html).not.toContain("undefined");
  });

  it("renders the Total Charged row as amount+fee", async () => {
    const html = await render(
      <DepositEmail
        role="USER_CONFIRMATION"
        userName="Bob"
        amount={10000}
        fee={500}
      />,
    );
    expect(html).toContain("Total Charged");
    // @react-email/render inserts <!-- --> between JSX text nodes, so
    // "UGX 10,500" renders as "UGX<!-- --> <!-- -->10,500" — strip comments.
    expect(html.replace(/<!--[\s\S]*?-->/g, "")).toContain("UGX 10,500");
  });
});
