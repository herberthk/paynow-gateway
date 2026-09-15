---
name: yo-payments
description: Integrate the Yo! Payments TypeScript SDK (@herberthtk/yo-payments-api) into a Next.js App Router app - deposits, withdrawals, airtime, statements, IPN verification, with Next.js security and performance best practices.
license: MIT
compatibility: Node.js 18+, Next.js 13+ App Router
metadata:
  audience: nextjs-developers
  stack: nextjs-app-router + yo-payments-api
  scope: deposits-withdrawals-airtime-statements-ipn
---

# Yo! Payments + Next.js

TypeScript client for the Yo! Payments mobile-money gateway
(`@herberthtk/yo-payments-api`): deposits (USSD PIN prompt),
status polling, internal transfers, balances, ministatements,
airtime, withdrawals, airtime-stock purchases, MSISDN KYC,
and RSA-verified IPN callbacks.

## When to use me

Use me when the user wants to:

- collect mobile money in Next.js (`acDepositFunds`)
- check a payment status / poll (`acTransactionCheckStatus`)
- pay out to mobile money (`acWithdrawFunds`, optionally with public-key auth)
- send airtime / buy airtime stock / internal transfers
- show balances, ministatements, or KYC lookups in Server Components
- receive Yo! IPN / failure webhooks in Route Handlers

Do NOT use for: Pages Router `getServerSideProps` patterns (adapt, don't copy),
Client Component direct gateway calls, edge runtime, or non-Uganda gateways.

## Golden rules (never break)

1. **Server-only, always.** The SDK handles API secrets and requires the
   Node.js runtime. `import "server-only"` (`npm i server-only`) at the top of
   every file that touches it. Never import into a `"use client"` file.
   Never expose `YO_API_*` as `NEXT_PUBLIC_*`. Pin `runtime = "nodejs"` on
   every route / action host that touches Yo! (Edge runtime is unsupported).
2. **Two failure channels — handle both.**
   - Business failure → _returned_ object: `Status: "FAILED"` + `ErrorMessageCode`/`ErrorMessage`. Check `Status` (and `TransactionStatus`) before trusting reference fields. Exception: `acTransactionCheckStatus` reports a dead transaction as `Status: "ERROR"` + `StatusCode: "2"` (not `"FAILED"`) — always branch on `TransactionStatus` (`SUCCEEDED|PENDING|FAILED|INDETERMINATE`).
   - Transport failure → _thrown_ `YoAPIError` (network errors, timeouts, HTTP errors). `try/catch` + `instanceof YoAPIError`.
3. **Gate all crediting on `is_verified === true` AND amount match AND idempotent `external_ref`.** IPNs carry no replay protection and verification is fail-closed (`false` on bad sig / missing cert — never throws). Reply `200 OK` fast; never do slow work (e.g. gateway calls) inside the webhook.
4. **Correlate webhooks on YOUR `ExternalReference`, never the gateway `TransactionReference`.** Neither callback carries `TransactionReference` (PHP-parity, by gateway design): success IPN `external_ref` === your `ExternalReference`, failure IPN `failed_transaction_reference` === your `ExternalReference`. Persist both at deposit time — `externalRef` (`@unique`, lookup key) + `yoTransactionReference` (for polling/support) — then `WHERE externalRef = payment.external_ref` / `WHERE externalRef = failure.failed_transaction_reference`.

## Quick setup

```bash
npm install @herberthtk/yo-payments-api server-only
```

```env
# .env.local — server-side only, never NEXT_PUBLIC_*
YO_API_USERNAME=your_username
YO_API_PASSWORD=your_password
YO_API_MODE=sandbox          # sandbox | production (SDK constructor defaults to production)
# YO_API_URL=https://...      # only for proxy/testing
# YO_PUBLIC_KEY_FILE=/path   # only for custom IPN cert
# YO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."  # payouts, \\n-escaped
```

```ts
// lib/yo.ts — one fresh client per request (YoAPI holds per-request state:
// externalReference, nonce, nonBlocking, ...). Never share across requests.
import "server-only";
import { YoAPI, type YoMode } from "@herberthtk/yo-payments-api";

export function getYoClient(): YoAPI {
  const username = process.env.YO_API_USERNAME!;
  const password = process.env.YO_API_PASSWORD!;
  // Constructor default is "production"; set YO_API_MODE explicitly per environment.
  const mode = (process.env.YO_API_MODE ?? "production") as YoMode;
  if (!username || !password)
    throw new Error("Set YO_API_USERNAME and YO_API_PASSWORD.");
  return new YoAPI(username, password, mode);
}
```

## Construction & config

```ts
import { YoAPI, YoAPIError } from "@herberthtk/yo-payments-api";
const api = new YoAPI(username, password, "production"); // "sandbox" | "production"
```

| Setter                                      | Type / default               | Notes                                                                                 |
| ------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| `setExternalReference`                      | `string\|null`, `null`       | Your idempotency key (invoice no). Sent with most writes. **Persist before calling.** |
| `setInternalReference`                      | `string\|null`, `null`       | Ref to another Yo! transaction                                                        |
| `setNonblocking`                            | `"TRUE"\|"FALSE"`, `"FALSE"` | `"TRUE"` = instant response; confirm via IPN + `acTransactionCheckStatus`             |
| `setInstantNotificationUrl`                 | `string\|null`               | Success IPN (non-blocking)                                                            |
| `setFailureNotificationUrl`                 | `string\|null`               | Failure IPN                                                                           |
| `setProviderReferenceText`                  | `string\|null`               | Appended to subscriber SMS                                                            |
| `setAuthenticationSignatureBase64`          | `string\|null`               | Only if Yo! support requires it for deposits                                          |
| `setDepositTransactionType`                 | `"PULL"\|"PUSH"`, `"PULL"`   | `acTransactionCheckStatus` follow-up flavor                                           |
| `setTransactionLimitAccountIdentifier`      | `string\|null`               | Ask account admin first                                                               |
| `setPublicKeyAuthenticationNonce`           | `string\|null`               | `crypto.randomUUID()` per payout                                                      |
| `setPublicKeyAuthenticationSignatureBase64` | `string\|null`               | Usually via `generatePublicKeyAuthenticationSignature`                                |
| `setPrivateKeyFileLocation`                 | `string\|null`               | PEM path — NOT for Vercel/Lambda                                                      |
| `setPrivateKeyContent`                      | `string\|null`               | PEM text — **use on serverless** (`env.replace(/\\n/g,"\n")`). Wins over file.        |
| `setPublicKeyFileUrl`                       | `string` (auto by mode)      | Only for custom certificates; omit otherwise                                          |
| `setUrl`                                    | gateway URL                  | Proxy/testing only                                                                    |
| `setTimeout`                                | ms, `120000`                 | `<=0` disables the timeout                                                            |
| `setTlsVerificationEnabled`                 | `boolean`, `true`            | Never disable in prod                                                                 |
| `setMaxResponseBytes`                       | `1024*1024`                  | Response cap                                                                          |

## Conventions

- All network methods are `async`, return typed objects, never `null` for optional-absent (fields omitted).
- Success: `Status: "OK"` (often + `TransactionStatus: "SUCCEEDED"`). Live gateway `StatusCode` is usually `"1"` (not `"200"`) and `StatusMessage` is often `""` — never assert on `"200"` or non-empty messages.
- Business failure: **returned**, `Status: "FAILED"` + `ErrorMessageCode`/`ErrorMessage`. Exception: `acTransactionCheckStatus` returns a failed poll as `Status: "ERROR"`, `StatusCode: "2"` with `TransactionStatus: "FAILED"` (see §2).
- Transport failure: **thrown** `YoAPIError { message, status?, body? (500 chars), cause? }`.
- `TransactionStatus`: `SUCCEEDED | PENDING | FAILED | INDETERMINATE`. Poll while `PENDING`. `INDETERMINATE` = reconcile via ministatement, not instant failure.
- Amounts `number|string` — pass a string (`"100.50"`) when exact formatting matters. Phones `"2567..."` (international, no `+`). Keep narratives short plain text.
- `Status === "OK"` with `TransactionStatus === "PENDING"` is the **normal**
  non-blocking response — it means "accepted, awaiting user PIN", not "paid".
  Final state arrives via IPN and/or `acTransactionCheckStatus`.

## Where each operation lives in Next.js

| Need                           | Next.js home                                           | SDK call                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deposit form submit            | Server Action (`"use server"`)                         | `setExternalReference(idemKey)` → persist PENDING → `acDepositFunds(msisdn, amount, narrative)` → save gateway ref                                                                   |
| Success webhook                | Route Handler `app/api/yo/ipn/route.ts`                | `receivePaymentNotification(body)` → verify → amount check → idempotent `PAID`, reply fast                                                                                           |
| Failure webhook                | Route Handler `app/api/yo/failure/route.ts`            | `receivePaymentFailureNotification(body)` → verify → idempotent `FAILED`, reply fast                                                                                                 |
| Poll pending deposit           | Server Action or client polling loop calling an Action | `acTransactionCheckStatus(null, externalRef)`                                                                                                                                        |
| Balance / statement / KYC page | Server Component or `lib/queries.ts`                   | `acAcctBalance`, `acGetMinistatement`, `acGetMsisdnKycInfo`                                                                                                                          |
| Payout (admin-only Action)     | Server Action + private-key-from-env                   | `setExternalReference(...)` → `setPublicKeyAuthenticationNonce(randomUUID)` → `setPrivateKeyContent(...)` → `generatePublicKeyAuthenticationSignature(...)` → `acWithdrawFunds(...)` |
| Airtime / transfer / stock     | Server Action                                          | `acSendAirtimeMobile`, `acSendAirtimeInternal`, `acInternalTransfer`, `acUserPurchaseAirtimestock`                                                                                   |

## Methods

### 1. `acDepositFunds(msisdn, amount, narrative): Promise<DepositFundsResponse>`

USSD PIN prompt to collect. Optional: `setNonblocking("TRUE")` + IPN URLs + `setAuthenticationSignatureBase64`.

```ts
// Persist externalRef BEFORE calling — webhooks echo it back (see Golden rule 4).
api.setExternalReference("INV-001");
const res = await api.acDepositFunds("256770000000", 10000, "Order #001");
// res = {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "",
//   TransactionStatus: "PENDING", // accepted, awaiting user PIN — NOT paid
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
// }
if (res.Status === "OK") {
  // Save BOTH: your key for webhooks + gateway ref for polling/support.
  await save({ externalRef: "INV-001", gatewayRef: res.TransactionReference });
} else {
  console.error(res.ErrorMessageCode, res.ErrorMessage);
}
```

Response: `Status, StatusCode, StatusMessage, TransactionStatus` + on success
`TransactionReference, MNOTransactionReferenceId, IssuedReceiptNumber`;
on failure `ErrorMessageCode, ErrorMessage`.

### 2. `acTransactionCheckStatus(txRef|null, privateRef=null): Promise<TransactionCheckStatusResponse>`

Pass gateway `TransactionReference`, or `null` + your `ExternalReference` as `privateRef`.
Call `setDepositTransactionType("PUSH")` first for PUSH deposits.

```ts
const st = await api.acTransactionCheckStatus(null, "INV-001");
// Still pending (money fields present even before settlement):
// st = {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "",
//   TransactionStatus: "PENDING",
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
//   Amount: "1350",
//   AmountFormatted: "UGX 1,350/=",
//   CurrencyCode: "UGX-MTNMM",
//   TransactionInitiationDate: "2026-09-13 18:43:25",
//   TransactionCompletionDate: "2026-09-13 18:43:25",
// }
// Settled successfully (IssuedReceiptNumber when the gateway sends it):
// st = {
//   Status: "OK",
//   StatusCode: "200",
//   StatusMessage: "OK",
//   TransactionStatus: "SUCCEEDED",
//   TransactionReference: "TRX-EX-1",
//   Amount: "10000",
//   AmountFormatted: "UGX 10,000",
//   CurrencyCode: "UGX",
//   TransactionInitiationDate: "2026-09-07T10:00:00",
//   TransactionCompletionDate: "2026-09-07T10:01:00",
//   IssuedReceiptNumber: "R-77",
// }
// Failed — Status is "ERROR" / StatusCode "2", NOT "FAILED"; branch on TransactionStatus:
// st = {
//   Status: "ERROR",
//   StatusCode: "2",
//   StatusMessage: "The transaction failed -- see 'ErrorMessage' for more information.",
//   TransactionStatus: "FAILED",
//   ErrorMessageCode: "33",
//   ErrorMessage: "33 ('Transaction failed. The Mobile Provider Transaction Processing System is Busy. Please try again Later.')",
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
// }
```

### 3. `acInternalTransfer(currencyCode, amount, beneficiaryAccount, beneficiaryEmail, narrative)`

Currency e.g. `UGX-MTNMM, UGX-MTNAT, UGX-WTLAT, UGX-OULAT, UGX-AIRAT`.
Same response shape as deposits.

```ts
// res = {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "",
//   TransactionStatus: "SUCCEEDED", // "PENDING" when setNonblocking("TRUE")
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
// }
```

### 4. `acAcctBalance(): Promise<AcctBalanceResponse>`

```ts
const { balance } = await api.acAcctBalance();
// [{ code: "UGX", balance: "50000" }, ...] — always an array
// {
//   Status: "OK",
//   StatusCode: "1",
//   balance: [
//     { code: "UGX", balance: "50000" },
//     { code: "UGX-MTNAT", balance: "1500" },
//   ],
// }
```

### 5. `acGetMinistatement(startDate?, endDate?, txStatus?, currency?, limit?, designation="ANY", extRef?)`

Dates `"YYYY-MM-DD HH:MM:SS"`. Status `SUCCEEDED|FAILED|PENDING|INDETERMINATE` (comma-join ok).
`limit 0` = all (careful — can exceed the 1 MiB cap / OOM; prefer 15–50 + pagination); default gateway 15. Designation `TRANSACTION|CHARGES|ANY`.

```ts
const st = await api.acGetMinistatement(
  "2026-09-10 00:00:00",
  "2026-09-10 23:59:59",
  "SUCCEEDED",
  "UGX-MTNMM",
  50,
);
for (const tx of st.Transactions) await reconcile(tx);
// st = {
//   Status: "OK",
//   StatusCode: "1",
//   TotalTransactions: "2",
//   ReturnedTransactions: "2",
//   Transactions: [
//     {
//       TransactionSystemId: "SYS-1",
//       TransactionReference: "TRX-EX-1",
//       TransactionStatus: "SUCCEEDED",
//       InitiationDate: "2026-09-07 10:00:00",
//       CompletionDate: "2026-09-07 10:01:00",
//       NarrativeBase64: "SGVsbG8=",
//       Currency: "UGX",
//       Amount: "100",
//       Balance: "900",
//       GeneralType: "DEPOSIT",
//       DetailedType: "MOBILE_MONEY_DEPOSIT",
//       BeneficiaryMsisdn: "256770000000",
//       BeneficiaryBase64: "QmVuZQ==",
//       SenderMsisdn: "256780000000",
//       SenderBase64: "U2VuZGVy",
//       Base64TransactionExternalReference: "RVhULTE=",
//       TransactionEntryDesignation: "TRANSACTION",
//     },
//   ],
// }
// tx: TransactionSystemId, TransactionReference, TransactionStatus,
// InitiationDate/CompletionDate, NarrativeBase64, Currency, Amount, Balance,
// GeneralType, DetailedType, BeneficiaryBase64/SenderBase64 (+ optional
// BeneficiaryMsisdn/SenderMsisdn/Base64TransactionExternalReference)
```

### 6. `acSendAirtimeMobile(msisdn, amount, narrative)` / `acSendAirtimeInternal(currency, amount, account, email, narrative)`

Currencies for internal: `UGX-MTNAT | UGX-WTLAT | UGX-OULAT | UGX-AIRAT`.
Same response shape as deposits.

```ts
// res = {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "",
//   TransactionStatus: "SUCCEEDED", // "PENDING" when setNonblocking("TRUE")
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
// }
```

### 7. `acWithdrawFunds(msisdn, amount, narrative): Promise<DepositFundsResponse>`

Needs API Access Letter; some payouts need public-key auth (see pattern 6 below).
Optional `setTransactionLimitAccountIdentifier`, nonce + signature.

```ts
// res = {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "",
//   TransactionStatus: "SUCCEEDED", // "PENDING" when setNonblocking("TRUE")
//   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
// }
```

### 8. `acUserPurchaseAirtimestock(airtimeCurrency, amount)`

Currency: `UGX-MTNAT | UGX-AIRAT | UGX-OULAT | UGX-UTLAT | UGX-SMTAT`.
Response: `Status, StatusCode, StatusMessage?, TransactionReference?, TotalCurrencyDebited?, CommissionAmount?`.

```ts
// {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "Purchased",
//   TransactionReference: "TRX-EX-1",
//   TotalCurrencyDebited: "1000",
//   CommissionAmount: "50",
// }
```

### 9. `acGetMsisdnKycInfo(msisdn): Promise<MsisdnKycInfoResponse>`

MTN/Airtel Uganda only, needs `support@yo.co.ug` permission.
Response: `Status, StatusCode, StatusMessage?, FirstName?, MiddleName?, Surname?`.

```ts
// {
//   Status: "OK",
//   StatusCode: "1",
//   StatusMessage: "Found",
//   FirstName: "John",
//   MiddleName: "Middle",
//   Surname: "Doe",
// }
```

### 10. IPN verification (sync, never throws, fail-closed)

```ts
const ok = api.receivePaymentNotification({
  ...req.body,
});
// ok = {
//   is_verified: true,
//   date_time: "2026-09-07 10:00:00",
//   amount: "1000",
//   narrative: "Payment",
//   network_ref: "NET-1",
//   external_ref: "EXT-1", // === YOUR ExternalReference → WHERE externalRef = this
//   msisdn: "256770000000",
// }
const fail = api.receivePaymentFailureNotification({
  ...req.body,
});
// fail = {
//   is_verified: true,
//   failed_transaction_reference: "TX_30VPJ68NOAG1", // === YOUR ExternalReference
//   transaction_init_date: "2026-09-13 18:43:25",
// }
// (Failure result has only these 3 fields — no amount, no gateway TransactionReference.)
```

Verified with RSA-SHA1 (SHA256 fallback, PHP parity) against the Yo!
certificate for your mode. A missing or bad signature yields
`is_verified: false`. Always dedupe on your reference — notifications can
arrive more than once.

> **Correlation (gateway design, PHP-parity):** neither callback includes the
> gateway `TransactionReference` returned by `acDepositFunds`. Both echo **your**
> `ExternalReference` instead — success IPN `external_ref` and failure IPN
> `failed_transaction_reference` are the value you sent via
> `setExternalReference()`. Schema pattern: `externalRef @unique` (webhook
> lookup key) + `yoTransactionReference` (polling via
> `acTransactionCheckStatus(null, externalRef)` / support). On success
> `WHERE externalRef = payment.external_ref`; on failure
> `WHERE externalRef = failure.failed_transaction_reference`.

### 11. `generatePublicKeyAuthenticationSignature(msisdn, amount, narrative): void`

Computes and stores the payout signature for the next `acWithdrawFunds`
call. Strict order: `setExternalReference` → `setPublicKeyAuthenticationNonce`
→ private key (`setPrivateKeyContent` / `setPrivateKeyFileLocation`) →
`generatePublicKeyAuthenticationSignature(...)` → `acWithdrawFunds(...)`.
It throws when the nonce or private key is missing or invalid,
so wrap the payout flow in `try/catch` and surface the message.

```ts
api.setExternalReference("SAL-001");
api.setPublicKeyAuthenticationNonce(crypto.randomUUID());
api.setPrivateKeyContent(process.env.YO_PRIVATE_KEY!.replace(/\\n/g, "\n"));
api.generatePublicKeyAuthenticationSignature("256770000000", 5000, "Payout");
await api.acWithdrawFunds("256770000000", 5000, "Payout");
```

## Canonical Next.js patterns

### Pattern 1. Deposit Server Action (validate → persist PENDING → call → save gateway ref)

```ts
// app/pay/actions.ts
"use server";
import "server-only";
import { z } from "zod";
import { YoAPIError } from "@herberthtk/yo-payments-api";
import { getYoClient } from "@/lib/yo";
import { db } from "@/lib/db"; // your ORM

const Schema = z.object({
  msisdn: z.string().regex(/^256(3|4|7)\d{8}$/),
  amount: z.coerce.number().int().min(500).max(5_000_000),
  narrative: z.string().trim().min(3).max(100),
});

export async function requestDeposit(
  msisdn: string,
  amount: number,
  narrative: string,
) {
  const p = Schema.safeParse({ msisdn, amount, narrative });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const externalRef = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await db.order.create({
    data: { externalRef, msisdn, amount, status: "PENDING" },
  }); // persist FIRST — makes retries and webhooks safe
  try {
    const api = getYoClient();
    api.setExternalReference(externalRef);
    api.setNonblocking("TRUE"); // recommended: instant response + IPN
    api.setInstantNotificationUrl(`${process.env.APP_URL}/api/yo/ipn`);
    api.setFailureNotificationUrl(`${process.env.APP_URL}/api/yo/failure`);
    api.setTimeout(25000);
    const res = await api.acDepositFunds(
      p.data.msisdn,
      p.data.amount,
      p.data.narrative,
    );
    // res = {
    //   Status: "OK",
    //   StatusCode: "1",
    //   StatusMessage: "",
    //   TransactionStatus: "PENDING", // awaiting PIN, NOT paid
    //   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
    // }
    if (res.Status === "OK") {
      await db.order.update({
        where: { externalRef },
        data: { yoTransactionReference: res.TransactionReference ?? null },
      });
      return { ok: true, reference: res.TransactionReference ?? externalRef };
    }
    await db.order.update({
      where: { externalRef },
      data: { status: "FAILED", error: res.ErrorMessage },
    });
    return { ok: false, message: res.ErrorMessage ?? "Deposit rejected." };
  } catch (e) {
    if (e instanceof YoAPIError)
      return {
        ok: false,
        message: "Network issue — we will confirm via SMS/IPN.",
      };
    throw e;
  }
}
```

```tsx
// app/pay/page.tsx — deposit form (Client) calling the Server Action
"use client";
import { useActionState } from "react";
import { requestDeposit } from "./actions";

export default function PayPage() {
  const [state, action, pending] = useActionState(
    async (_: unknown, fd: FormData) => {
      return requestDeposit(
        String(fd.get("msisdn")),
        Number(fd.get("amount")),
        String(fd.get("narrative")),
      );
    },
    null,
  );
  return (
    <form action={action}>
      <input
        name="msisdn"
        placeholder="256770000000"
        required
        pattern="256(3|4|7)[0-9]{8}"
      />
      <input name="amount" type="number" min={500} required />
      <input name="narrative" maxLength={100} required />
      <button disabled={pending}>{pending ? "Sending…" : "Pay"}</button>
      {state && <p>{(state as { message?: string }).message}</p>}
    </form>
  );
}
```

### Pattern 2. Success webhook (verify → amount check → idempotent credit, reply fast)

```prisma
// Prisma — correlate webhooks on YOUR ref, not the gateway ref.
// Neither callback carries TransactionReference (PHP-parity, by design):
// success external_ref === ExternalReference,
// failure failed_transaction_reference === ExternalReference.
model Order {
  id                     String    @id @default(cuid())
  externalRef            String    @unique // lookup key for BOTH webhooks
  yoTransactionReference String?   // from acDepositFunds, for polling/support
  amount                 Int
  status                 String    @default("PENDING")
  networkRef             String?
  paidAt                 DateTime?
}
```

```ts
// app/api/yo/ipn/route.ts
import "server-only";
import { getYoClient } from "@/lib/yo";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const body = Object.fromEntries(form.entries()) as any;
  const p = getYoClient().receivePaymentNotification(body);
  // p = {
  //   is_verified: true,
  //   date_time: "2026-09-07 10:00:00",
  //   amount: "1000",
  //   narrative: "Payment",
  //   network_ref: "NET-1",
  //   external_ref: "EXT-1", // === YOUR ExternalReference
  //   msisdn: "256770000000",
  // }
  if (!p.is_verified) {
    console.warn("yo ipn NOT VERIFIED", b.external_ref);
    return new Response("NOT VERIFIED", { status: 400 });
  }
  if (!p.external_ref) return new Response("NO REF", { status: 400 });
  // Verified: trust external_ref + amount, update idempotently, reply fast.
  // Do NOT call acTransactionCheckStatus here — reconcile via polling/cron.
  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { externalRef: p.external_ref },
      });
      if (!order || order.status === "PAID") return; // idempotent skip (replay-safe)
      if (String(order.amount) !== String(p.amount)) {
        await tx.order.update({
          where: { externalRef: p.external_ref },
          data: { status: "AMOUNT_MISMATCH" },
        });
        return;
      }
      await tx.order.update({
        where: { externalRef: p.external_ref },
        data: { status: "PAID", networkRef: p.network_ref, paidAt: new Date() },
      });
    });
  } catch {
    return new Response("RETRY", { status: 500 });
  } // gateway retries on non-2xx
  return new Response("OK");
}
```

### Pattern 3. Failure webhook (verify → idempotent FAILED, reply fast)

```ts
// app/api/yo/failure/route.ts
import "server-only";
import { getYoClient } from "@/lib/yo";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const body = Object.fromEntries(form.entries()) as any;
  const f = getYoClient().receivePaymentFailureNotification(body);
  // f = {
  //   is_verified: true,
  //   failed_transaction_reference: "TX_30VPJ68NOAG1", // === YOUR ExternalReference
  //   transaction_init_date: "2026-09-13 18:43:25",
  // }
  // (Only 3 fields — no amount, no gateway TransactionReference.)
  if (!f.is_verified) {
    console.warn("yo fpn NOT VERIFIED", b.failed_transaction_reference);
    return new Response("NOT VERIFIED", { status: 400 });
  }
  if (!f.failed_transaction_reference)
    return new Response("NO REF", { status: 400 });
  // failed_transaction_reference === your ExternalReference (NOT res.TransactionReference)
  try {
    await db.order.updateMany({
      where: { externalRef: f.failed_transaction_reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
  } catch {
    return new Response("RETRY", { status: 500 });
  }
  return new Response("OK");
}
```

### Pattern 4. Status polling (client, exponential backoff)

```ts
// app/pay/status-action.ts
"use server";
import { getYoClient } from "@/lib/yo";
export async function checkDepositStatus(externalRef: string) {
  const res = await getYoClient().acTransactionCheckStatus(null, externalRef);
  // res = {
  //   Status: "OK",
  //   StatusCode: "1",
  //   StatusMessage: "",
  //   TransactionStatus: "PENDING", // or "SUCCEEDED" (Status "OK") / "FAILED" (Status "ERROR", StatusCode "2")
  //   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
  //   Amount: "1350",
  //   AmountFormatted: "UGX 1,350/=",
  //   CurrencyCode: "UGX-MTNMM",
  //   TransactionInitiationDate: "2026-09-13 18:43:25",
  //   TransactionCompletionDate: "2026-09-13 18:43:25",
  // }
  return {
    status: res.TransactionStatus,
    reference: res.TransactionReference ?? null,
  };
}
```

```tsx
// poll from client with SWR or plain effect:
useEffect(() => {
  let delay = 5000;
  let stop = false;
  (async function poll() {
    while (!stop) {
      const s = await checkDepositStatus(externalRef);
      // Stop on SUCCEEDED/FAILED; INDETERMINATE → keep polling, reconcile via ministatement.
      if (s.status !== "PENDING" && s.status !== "INDETERMINATE") {
        setStatus(s.status);
        break;
      }
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, 30000);
    }
  })();
  return () => {
    stop = true;
  };
}, [externalRef]);
```

Set `setDepositTransactionType("PUSH")` before polling only for PUSH deposits.

Non-blocking one-shot alternative (server-side, prefer client polling on Vercel):

```ts
const externalRef = `INV-${Date.now()}`;
api.setExternalReference(externalRef);
api.setNonblocking("TRUE");
api.setInstantNotificationUrl("https://yourdomain.com/api/yo/ipn");
api.setFailureNotificationUrl("https://yourdomain.com/api/yo/failure");
const res = await api.acDepositFunds(msisdn, amount, narrative);
// IPN credits async; poll acTransactionCheckStatus(null, externalRef)
// until TransactionStatus leaves PENDING (SUCCEEDED|FAILED; INDETERMINATE → ministatement).
```

### Pattern 5. Statement / balance page (Server Component + Suspense)

```tsx
// app/statement/page.tsx
import { Suspense } from "react";
import { getBalances, getStatement } from "@/lib/queries";

export const runtime = "nodejs";
export const revalidate = 60; // cache reads; IPN path uses force-dynamic

// Note (Next 15+): searchParams is async — `await searchParams` there.
export default async function Page({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Tables status={searchParams.status ?? "SUCCEEDED"} />
    </Suspense>
  );
}
async function Tables({ status }: { status: string }) {
  const [balances, st] = await Promise.all([
    getBalances(), // separate clients inside — safe for Promise.all
    getStatement({ transactionStatus: status, resultSetLimit: 50 }),
  ]);
  return (
    <pre>{JSON.stringify({ balances, txs: st.transactions }, null, 2)}</pre>
  );
}
```

```ts
// lib/queries.ts
import "server-only";
import { unstable_cache } from "next/cache";
import { getYoClient } from "./yo";

export const getBalances = unstable_cache(
  async () => {
    return (await getYoClient().acAcctBalance()).balance;
  },
  ["yo-balances"],
  { revalidate: 60 },
);

export async function getStatement(q: {
  transactionStatus?: string;
  resultSetLimit?: number;
}) {
  const api = getYoClient();
  api.setTimeout(20000);
  const res = await api.acGetMinistatement(
    null,
    null,
    q.transactionStatus ?? null,
    null,
    q.resultSetLimit ?? 50,
    "ANY",
  );
  // res = {
  //   Status: "OK",
  //   StatusCode: "1",
  //   TotalTransactions: "2",
  //   ReturnedTransactions: "2",
  //   Transactions: [
  //     {
  //       TransactionReference: "TRX-EX-1",
  //       TransactionStatus: "SUCCEEDED",
  //       Amount: "10000",
  //       Currency: "UGX",
  //       TransactionEntryDesignation: "TRANSACTION",
  //       // ...TransactionSystemId, InitiationDate, CompletionDate, Balance,
  //       // GeneralType, DetailedType, Base64 fields
  //     },
  //   ],
  // }
  return {
    status: res.Status,
    total: res.TotalTransactions,
    transactions: res.Transactions,
  };
}
```

### Pattern 6. Payout (admin-only) with key auth + KYC gate

```ts
// app/admin/payout-action.ts
"use server";
import "server-only";
import { getYoClient } from "@/lib/yo";
import { requireAdmin } from "@/lib/auth";

export async function payout(
  msisdn: string,
  amount: number,
  narrative: string,
) {
  await requireAdmin();
  const key = process.env.YO_PRIVATE_KEY ?? "";
  if (!key) return { ok: false, message: "Server misconfigured." };
  const api = getYoClient();
  const kyc = await getYoClient().acGetMsisdnKycInfo(msisdn); // separate client!
  if (kyc.Status !== "OK")
    return { ok: false, message: "KYC lookup failed — aborting payout." };
  api.setExternalReference(`SAL-${Date.now()}`);
  api.setPublicKeyAuthenticationNonce(crypto.randomUUID()); // unique per request
  api.setPrivateKeyContent(key.replace(/\\n/g, "\n"));
  try {
    api.generatePublicKeyAuthenticationSignature(msisdn, amount, narrative);
    const res = await api.acWithdrawFunds(msisdn, amount, narrative);
    // res = {
    //   Status: "OK",
    //   StatusCode: "1",
    //   StatusMessage: "",
    //   TransactionStatus: "SUCCEEDED", // or "PENDING" right after the request
    //   TransactionReference: "RcUXnX2uJYz76DDFPGfMrVzS3X3nkDJ07COFq32FodSLi6p9HGWdsjlneaCjQFaZ4dcac0ae2d4cdacf9f83dd2d7e2c9997",
    // }
    if (res.TransactionStatus === "SUCCEEDED")
      return { ok: true, reference: res.TransactionReference };
    return { ok: false, message: res.ErrorMessage ?? "Payout failed." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
```

## Data rules that bite

- Phones: `"256770000000"` — international, no `+`. Validate server-side.
- Amounts: `number | string` — pass a **string** (`"100.50"`) when exact
  formatting matters.
- Keep narratives short plain text (see the zod `Schema` in Pattern 1:
  3–100 chars).
- `TransactionStatus`: `SUCCEEDED` | `PENDING` | `FAILED` | `INDETERMINATE`.
  Poll while `PENDING`. `INDETERMINATE` = reconcile via ministatement, not failure.
- Webhook correlation: success `external_ref` and failure
  `failed_transaction_reference` both echo your `ExternalReference`.
  Store `externalRef UNIQUE` + `yoTransactionReference` at deposit time;
  never expect `TransactionReference` inside a callback body.
- `acGetMinistatement` dates are `"YYYY-MM-DD HH:MM:SS"`;
  `resultSetLimit: 0` = all (dangerous — prefer 15–50 + pagination, the 1 MiB
  response cap can bite); `Transactions` is always an array. Currency codes like
  `UGX-MTNMM`, `UGX-MTNAT`, `UGX-WTLAT`, `UGX-OULAT`, `UGX-AIRAT`.
- `acUserPurchaseAirtimestock` sends your ref inside `<TransactionReference>`.
- KYC (`acGetMsisdnKycInfo`) is MTN/Airtel Uganda only, needs Yo! permission.
- Sandbox vs production gateway + cert are picked by constructor `mode`.
  `setUrl` / `setPublicKeyFileUrl` only for proxies/custom certs.
- `setTimeout(ms)` default `120000`; `<= 0` disables. Interactive Actions
  15–30s (`api.setTimeout(20000–25000)`), cron reconciliation 60s+.
  On Vercel also set `export const maxDuration = 60`.

## Security (Next.js)

Fail-closed by default: TLS is verified, and unverifiable IPNs return
`is_verified: false` (never throw). Your job is to not undo those guarantees.

**Server boundary**

- Every file importing `@herberthtk/yo-payments-api` starts with
  `import "server-only"`. CI gate: files matching `"use client"` must never
  import it — enforce with
  `grep -rn "yo-payments-api\|lib/yo" app components --include="*.tsx" | grep "use client"`
  returning empty.
- `export const runtime = "nodejs"` on all Yo! routes/actions hosts.
  The Edge runtime is not supported.
- Env is server-only: `YO_API_USERNAME`, `YO_API_PASSWORD`, `YO_API_URL`,
  `YO_PUBLIC_KEY_FILE`, `YO_PRIVATE_KEY`. Never `NEXT_PUBLIC_*`. Use separate
  sandbox vs production projects. Rotate credentials + private key on any leak.
- Leave TLS verification enabled (the default). Only disable it for local
  testing against self-signed stubs — never in production.

**Input validation (all Server Actions)**

Validate every arg with zod (see the `Schema` in Pattern 1) before it
reaches the gateway. Auth-check + rate-limit: payouts, transfers, airtime =
admin/authenticated only; deposits rate-limited per user/IP. Log `externalRef`
per caller for abuse tracing. Prefer `string` amounts (`"100.50"`) over floats.

**IPN / failure webhook defense**

| Threat               | Mitigation                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forged callback      | Gate on `is_verified === true`. Wrong cert/mode → always false — alert on spikes of `400 NOT VERIFIED` (usually sandbox cert vs prod traffic).                          |
| Replay               | Dedupe on your reference (`external_ref` / `failed_transaction_reference`) with a DB unique constraint; skip already-`PAID`. No in-memory sets (serverless loses them). |
| Amount swap          | Compare webhook `amount` to the stored order amount as **strings** before marking paid; quarantine mismatches (`AMOUNT_MISMATCH`), never auto-credit.                   |
| Missing ref          | `400` when the reference is empty; never credit "unmatched" money automatically — hold for manual reconciliation via ministatement.                                     |
| Slowloris / retries  | Reply `200 OK` fast; do heavy work (email, fulfillment) via queue/`after()`. Return non-2xx only to request a gateway retry.                                            |
| Spoofed content-type | Parse via `req.formData()` and keep only `string` entries (drop `File`s) before verifying — never verify raw unfiltered input.                                          |

Failure notifications get the same treatment via
`receivePaymentFailureNotification` — verify, then mark `FAILED` idempotently.

**Payout hardening**

- Require API Access Letter (gateway-side) + app-side admin auth + KYC:
  `acGetMsisdnKycInfo(msisdn)` before first payout to a new number
  (MTN/Airtel UG only; needs Yo! permission — fail closed if lookup fails).
- Fresh `crypto.randomUUID()` nonce per payout; key from
  `YO_PRIVATE_KEY` env with `.replace(/\\n/g, "\n")` + `setPrivateKeyContent`
  (never a checked-in PEM, never `setPrivateKeyFileLocation` on serverless).
- Double-entry: insert `payouts(externalRef UNIQUE, status=PENDING)` first,
  then call gateway, then update — makes retries safe.
- Manual-approval threshold (e.g. > 200k UGX needs a second admin).

**Logging & secrets**

- Never log `password`, `YO_PRIVATE_KEY`, or full request payloads (they
  contain your API credentials). Log `externalRef`, `TransactionReference`,
  `Status/TransactionStatus`, `ErrorMessageCode` only.
- `YoAPIError.body` is pre-truncated to 500 chars — safe to log, but strip
  before sending to the client (return generic "Gateway unreachable").
- Alert on: `is_verified:false` rate, `INDETERMINATE` outcomes, TLS errors,
  `YoAPIError` bursts (gateway down), amount mismatches.

**Certificates**

- IPN certificates are picked automatically from your `mode` (sandbox vs
  production). Override with `setPublicKeyFileUrl` / `YO_PUBLIC_KEY_FILE`
  only if Yo! rotates certificates or your account team instructs it.

## Performance (Next.js)

Gateway calls are slow (USSD prompts, blocking deposits up to the 120s
timeout). Keep them off render paths and off the client bundle.

**Non-blocking first**

- Blocking `acDepositFunds` holds the Server Action / route for the whole
  USSD authorization. Default `setTimeout` is `120000`ms — past Vercel's
  limits. Prefer:
  ```ts
  api.setNonblocking("TRUE");
  api.setInstantNotificationUrl("https://yourdomain.com/api/yo/ipn");
  api.setFailureNotificationUrl("https://yourdomain.com/api/yo/failure");
  api.setTimeout(25000);
  ```
  then credit via IPN + poll `acTransactionCheckStatus(null, externalRef)`
  until `SUCCEEDED|FAILED` (`INDETERMINATE` → ministatement).
- `export const maxDuration = 60` on routes that must call the gateway;
  keep interactive Actions at 15–30s timeouts, cron reconciliation at 60s+.
- Poll from the **client** (SWR / effect with exponential backoff 5s→30s,
  see Pattern 4) hitting a light status Action — never `while(true){ sleep(5s) }`
  on the server (burns wall-clock, hits `maxDuration`).

**Caching & data-fetching**

- Balances change slowly: `unstable_cache(acAcctBalance, ["yo-balances"], { revalidate: 60 })`.
- Ministatements: cache per filter, `revalidate` 30–300s; paginate
  (`resultSetLimit: 15–50`), never `0` (= all — can exceed the 1 MiB cap / OOM).
  `Transactions` is always an array — render empty states, not spinners.
- Wrap gateway reads in `<Suspense>`; use `loading.tsx` skeletons.
  Parallelize independent reads with `Promise.all` — but with **separate
  clients** (a shared instance corrupts `externalReference`/nonce state):
  ```ts
  const [b, s] = await Promise.all([
    getBalances(),
    getStatement({ resultSetLimit: 50 }),
  ]);
  ```

**Cron reconciliation (catches missed IPNs)**

- Daily cron (`vercel.json` crons / `app/api/cron/reconcile`) calling
  `acGetMinistatement(yesterday 00:00:00 → 23:59:59, "SUCCEEDED,FAILED,PENDING", ..., pageSize)`
  in pages of ~100 catches missed webhooks. `INDETERMINATE` → re-check next
  run, alert after N runs. Same dedupe rule: match on your `externalRef`.
- SDK calls are never cached by Next.js; don't wrap them in cached `fetch`.

**Bundle & runtime**

- Import the SDK in server files only — it never ships to the browser.
  Verify with `next build` / `@next/bundle-analyzer`. Works with
  `output: "standalone"` and serverless deploys.
- Signing (`generatePublicKeyAuthenticationSignature`) and IPN verification
  are fast — run them inline, verifying IPNs before any DB work.

**Timeouts & resilience**

```ts
api.setTimeout(20000); // interactive calls; use 60s+ for cron reconciliation
```

- Map `YoAPIError` timeouts to "pending — we'll confirm" rather than
  "failed". Status stays `PENDING` server-side until IPN/poll resolves.
- Idempotency keys (`externalRef` persisted pre-call) make retries free:
  same key → same logical payment; gateway dupes reconcile via status check.

## Error handling

```ts
import { YoAPIError } from "@herberthtk/yo-payments-api";
try {
  const res = await api.acAcctBalance();
  // res = { Status: "OK", StatusCode: "1", balance: [{ code: "UGX", balance: "50000" }] }
  if (res.Status !== "OK") {
    /* business failure: res.ErrorMessageCode / res.ErrorMessage */
  }
} catch (e) {
  if (e instanceof YoAPIError)
    console.error(e.message, e.status, e.body, e.cause);
  // YoAPIError = { message: string, status?: number, body?: string (500 chars), cause?: unknown }
  // network errors, timeouts, HTTP errors
}
```

Map timeouts to "pending — we'll confirm" (not "failed"): status stays
`PENDING` server-side until IPN/poll resolves.
