"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { YoAPIError } from "@herberthtk/yo-payments-api";
import prisma from "@/lib/prisma";
import { generateTxRef } from "@/utils";
import { getUserSession } from "./session";
import { getTransactionFee } from "./fee";
import {
  sendDepositEmail,
  sendAdminDepositNoticeEmail,
  sendDepositFailureEmail,
} from "./email";
import {
  getYoClient,
  configureDepositRequest,
  getYoWebhookUrls,
} from "@/lib/yo/client";
import {
  parseTopupMsisdn,
  normalizeUgMsisdn,
  methodLabelFor,
} from "@/lib/yo/phone";
import { buildTopupNarrative } from "@/lib/yo/narrative";
import {
  MIN_TOPUP,
  MAX_TOPUP,
  MAX_PENDING_DEPOSITS,
  RATE_LIMIT_WINDOW_MINUTES,
  STATUS_POLL_TIMEOUT_MS,
} from "@/lib/yo/constants";
import { creditDepositFee } from "./deposit-fee";
import { getCachedAdmins } from "./admin/admin-mgmt";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export type YoTopupStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "INDETERMINATE";

const initiateSchema = z.object({
  amount: z.coerce.number().int().min(MIN_TOPUP).max(MAX_TOPUP),
  msisdn: z.string().trim().min(7).max(16),
});

// ---------------------------------------------------------------------------
// Internal: shared settlement (webhooks + polling + cron use this)
// ---------------------------------------------------------------------------

type SettleSuccessInput = {
  externalRef: string;
  /** Gateway-reported amount (webhook `amount` / status `Amount`). */
  gatewayAmount?: string | null;
  /** Gateway-reported payer MSISDN (webhook `msisdn`). */
  gatewayMsisdn?: string | null;
  networkRef?: string | null;
  gatewayRef?: string | null;
  receiptUrl?: string | null;
};

export type SettleResult =
  | { applied: true }
  | {
      applied: false;
      reason:
        | "unknown-ref"
        | "already-processed"
        | "amount-mismatch"
        | "msisdn-mismatch"
        | "amount-unknown";
    };

/** Sentinel for a lost settlement race — aborts the interactive tx. */
class SettlementRace extends Error {
  constructor() {
    super("settlement already applied concurrently");
    this.name = "SettlementRace";
  }
}

/** Mask an MSISDN for logs: first 6 chars + "***" (never log full numbers). */
const maskMsisdn = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  return s.length <= 6 ? "***" : `${s.slice(0, 6)}***`;
};

/**
 * `after()` from a shared lib throws outside request scope (CLI, workers).
 * Fall back to a floating promise so background notifications still send.
 */
const runAfterSettlement = (
  task: () => Promise<void>,
  context: Record<string, unknown>,
) => {
  try {
    after(task);
  } catch {
    void task().catch((error) =>
      console.error("yo post-settlement task failed", { ...context, error }),
    );
  }
};

/**
 * Idempotent success settlement: credits the wallet exactly once.
 * Safe to call from success IPN, status polling and cron reconciliation.
 *
 * Concurrency: the terminal transition (transaction → COMPLETED plus
 * guard → processed) happens inside ONE interactive transaction, gated by
 * conditional `updateMany` counts. Concurrent settlers serialize on the
 * row locks; losers see count 0 and roll back without crediting.
 * Lock order (transaction row → guard row) is identical in every
 * settlement path to avoid deadlocks.
 */
export const finalizeYoSuccess = async ({
  externalRef,
  gatewayAmount,
  gatewayMsisdn,
  networkRef,
  gatewayRef,
  receiptUrl,
}: SettleSuccessInput): Promise<SettleResult> => {
  const guard = await prisma.processedTransaction.findUnique({
    where: { externalReference: externalRef },
  });
  if (!guard) return { applied: false, reason: "unknown-ref" };

  const txn = await prisma.transaction.findUnique({
    where: { externalReference: externalRef },
  });
  if (!txn) return { applied: false, reason: "unknown-ref" };
  if (txn.status !== "PENDING" && txn.status !== "INDETERMINATE") {
    await prisma.processedTransaction.updateMany({
      where: { externalReference: externalRef, processed: false },
      data: { processed: true, processedAt: new Date() },
    });
    return { applied: false, reason: "already-processed" };
  }

  const amount = txn.amount.toNumber();
  const fee = txn.fee.toNumber();
  const expectedTotal = amount + fee;

  // Amount-swap defense: compare as integer minor units (UGX has no fractions).
  // Strip commas/whitespace first — the gateway may send "10,000.00".
  const rawAmount =
    gatewayAmount == null ? "" : String(gatewayAmount).replace(/[,\s]/g, "");
  if (rawAmount === "") {
    // Fail closed but recoverable: leave unprocessed so the reconciler
    // (which supplies Amount from a status check) can settle later.
    console.warn("yo deposit missing gateway amount", { externalRef });
    return { applied: false, reason: "amount-unknown" };
  }
  const paid = Number(rawAmount);
  if (!Number.isFinite(paid) || Math.round(paid) !== expectedTotal) {
    return quarantineDeposit(
      externalRef,
      txn.userId,
      "amount-mismatch",
      { expectedTotal, gatewayAmount: rawAmount },
      networkRef,
    );
  }

  // Payer binding: the IPN msisdn must match the number we prompted.
  // Normalize both sides (07… vs 256… vs +256… with spaces/dashes);
  // fall back to trimmed raw compare when either side won't normalize.
  // Quarantine only on definite mismatch.
  const rawGatewayMsisdn =
    gatewayMsisdn == null ? "" : String(gatewayMsisdn).trim();
  const rawStoredMsisdn = txn.msisdn == null ? "" : String(txn.msisdn).trim();
  if (rawGatewayMsisdn !== "" && rawStoredMsisdn !== "") {
    const normGateway = normalizeUgMsisdn(rawGatewayMsisdn);
    const normStored = normalizeUgMsisdn(rawStoredMsisdn);
    const msisdnMismatch =
      normGateway.ok && normStored.ok
        ? normGateway.msisdn !== normStored.msisdn
        : rawGatewayMsisdn !== rawStoredMsisdn;
    if (msisdnMismatch) {
      return quarantineDeposit(
        externalRef,
        txn.userId,
        "msisdn-mismatch",
        {
          expectedMsisdn: maskMsisdn(txn.msisdn),
          gatewayMsisdn: maskMsisdn(rawGatewayMsisdn),
        },
        networkRef,
      );
    }
  }

  // Parallelize independent reads; the updateMany counts inside the
  // transaction below are authoritative against concurrent settlers.
  const [user, admins] = await Promise.all([
    prisma.user.findUnique({ where: { id: txn.userId } }),
    getCachedAdmins(),
  ]);
  if (!user) return { applied: false, reason: "unknown-ref" };
  const method = txn.method;
  const provider = txn.provider;

  try {
    await prisma.$transaction(async (tx) => {
      const marked = await tx.transaction.updateMany({
        where: {
          externalReference: externalRef,
          status: { in: ["PENDING", "INDETERMINATE"] },
        },
        data: {
          status: "COMPLETED",
          ...(networkRef ? { networkRef } : {}),
          ...(gatewayRef ? { providerRef: gatewayRef } : {}),
          ...(receiptUrl ? { receiptUrl } : {}),
        },
      });
      if (marked.count > 1) {
        console.warn("yo settlement corruption: success marked >1", {
          externalRef,
          count: marked.count,
        });
      }
      if (marked.count !== 1) throw new SettlementRace();
      const claimed = await tx.processedTransaction.updateMany({
        where: { externalReference: externalRef, processed: false },
        data: {
          processed: true,
          processedAt: new Date(),
          ...(gatewayRef ? { transactionReference: gatewayRef } : {}),
        },
      });
      if (claimed.count > 1) {
        console.warn("yo settlement corruption: success claimed >1", {
          externalRef,
          count: claimed.count,
        });
      }
      if (claimed.count !== 1) throw new SettlementRace();

      await tx.wallet.create({
        data: {
          userId: txn.userId,
          amount,
          type: "CREDIT",
          reason: "Mobile Money Deposit",
          refference: externalRef,
          mobileMoneyProvider: provider ?? undefined,
          paymentMethod: "MOBILE_MONEY",
        },
      });

      await creditDepositFee(tx, {
        fromUserId: txn.userId,
        externalRef,
        fee,
        admins,
      });

      await tx.systemNotification.create({
        data: {
          fromUserId: txn.userId,
          toUserId: txn.userId,
          title: "Deposit Successful",
          message: `Your deposit of UGX ${amount.toLocaleString()} has been processed successfully.`,
          type: "SUCCESS",
          path: `/dashboard/user/transactions?query=${encodeURIComponent(externalRef)}`,
        },
      });
    });
  } catch (error) {
    if (error instanceof SettlementRace) {
      return { applied: false, reason: "already-processed" };
    }
    throw error;
  }

  // Emails after commit — never block settlement on mail delivery.
  runAfterSettlement(async () => {
    try {
      if (user.email) {
        await sendDepositEmail({
          email: user.email,
          userName: user.name || "User",
          amount,
          reference: externalRef,
          fee,
          method,
        });
      }
      await Promise.all(
        admins.map((admin) =>
          admin.email
            ? sendAdminDepositNoticeEmail({
                email: admin.email,
                userName: user.name || "User",
                adminName: admin.name || "Admin",
                amount,
                reference: externalRef,
                fee,
                method,
              })
            : Promise.resolve(),
        ),
      );
    } catch (error) {
      console.error("yo success email failed", { externalRef, error });
    }
  }, { externalRef });

  revalidatePath("/dashboard/user/wallet");
  revalidatePath("/dashboard/user/transactions");
  return { applied: true };
};

/**
 * Quarantine a suspicious deposit (amount/msisdn mismatch): mark FAILED
 * with an atomic gate so concurrent settlers can't double-quarantine,
 * then notify the user for manual review. Never moves money.
 */
const quarantineDeposit = async (
  externalRef: string,
  userId: number,
  reason: "amount-mismatch" | "msisdn-mismatch",
  details: Record<string, unknown>,
  networkRef?: string | null,
): Promise<SettleResult> => {
  try {
    await prisma.$transaction(async (tx) => {
      const marked = await tx.transaction.updateMany({
        where: {
          externalReference: externalRef,
          status: { in: ["PENDING", "INDETERMINATE"] },
        },
        data: {
          status: "FAILED",
          reason: "Held for manual review — details did not match",
          ...(networkRef ? { networkRef } : {}),
        },
      });
      if (marked.count > 1) {
        console.warn("yo settlement corruption: quarantine marked >1", {
          externalRef,
          count: marked.count,
        });
      }
      if (marked.count !== 1) throw new SettlementRace();
      const claimed = await tx.processedTransaction.updateMany({
        where: { externalReference: externalRef, processed: false },
        data: { processed: true, processedAt: new Date() },
      });
      if (claimed.count > 1) {
        console.warn("yo settlement corruption: quarantine claimed >1", {
          externalRef,
          count: claimed.count,
        });
      }
      if (claimed.count !== 1) throw new SettlementRace();
      await tx.systemNotification.create({
        data: {
          fromUserId: userId,
          toUserId: userId,
          title: "Deposit held for review",
          message: `Your deposit ${externalRef} was held because the received details did not match. Support will contact you within 24 hours.`,
          type: "ALERT",
          path: `/dashboard/user/transactions?query=${encodeURIComponent(externalRef)}`,
        },
      });
    });
  } catch (error) {
    if (error instanceof SettlementRace) {
      return { applied: false, reason: "already-processed" };
    }
    throw error;
  }

  console.warn(`yo deposit ${reason}`, { externalRef, ...details });
  revalidatePath("/dashboard/user/wallet");
  revalidatePath("/dashboard/user/transactions");
  return { applied: false, reason };
};

/**
 * Idempotent failure settlement: marks FAILED, notifies user. No wallet move.
 * Uses the same atomic gate + lock order as the success path.
 */
export const finalizeYoFailure = async (
  externalRef: string,
): Promise<
  | { applied: true }
  | { applied: false; reason: "unknown-ref" | "already-processed" }
> => {
  const guard = await prisma.processedTransaction.findUnique({
    where: { externalReference: externalRef },
  });
  if (!guard) return { applied: false, reason: "unknown-ref" };

  const txn = await prisma.transaction.findUnique({
    where: { externalReference: externalRef },
  });
  if (!txn) return { applied: false, reason: "unknown-ref" };

  const user = await prisma.user.findUnique({ where: { id: txn.userId } });
  const amount = txn.amount.toNumber();

  try {
    await prisma.$transaction(async (tx) => {
      const marked = await tx.transaction.updateMany({
        where: {
          externalReference: externalRef,
          status: { in: ["PENDING", "INDETERMINATE"] },
        },
        data: {
          status: "FAILED",
          reason: "Mobile money authorization failed",
        },
      });
      if (marked.count > 1) {
        console.warn("yo settlement corruption: failure marked >1", {
          externalRef,
          count: marked.count,
        });
      }
      if (marked.count !== 1) throw new SettlementRace();
      const claimed = await tx.processedTransaction.updateMany({
        where: { externalReference: externalRef, processed: false },
        data: { processed: true, processedAt: new Date() },
      });
      if (claimed.count > 1) {
        console.warn("yo settlement corruption: failure claimed >1", {
          externalRef,
          count: claimed.count,
        });
      }
      if (claimed.count !== 1) throw new SettlementRace();
      await tx.systemNotification.create({
        data: {
          fromUserId: txn.userId,
          toUserId: txn.userId,
          title: "Deposit Failed",
          message: `Your deposit of UGX ${amount.toLocaleString()} could not be completed. No money was deducted from your wallet.`,
          type: "ALERT",
          path: `/dashboard/user/wallet/topup?ref=${encodeURIComponent(externalRef)}`,
        },
      });
    });
  } catch (error) {
    if (error instanceof SettlementRace)
      return { applied: false, reason: "already-processed" };
    throw error;
  }

  runAfterSettlement(async () => {
    try {
      if (user?.email) {
        await sendDepositFailureEmail({
          email: user.email,
          userName: user.name || "User",
          amount,
          reference: externalRef,
          method: txn.method,
        });
      }
    } catch (error) {
      console.error("yo failure email failed", { externalRef, error });
    }
  }, { externalRef });

  revalidatePath("/dashboard/user/wallet");
  revalidatePath("/dashboard/user/transactions");
  return { applied: true };
};

// ---------------------------------------------------------------------------
// Initiate: validate → persist PENDING → gateway prompt
// ---------------------------------------------------------------------------

export const initiateYoDeposit = async (input: {
  amount: number;
  msisdn: string;
}): Promise<
  | {
      success: true;
      externalRef: string;
      provider: "MTN" | "AIRTEL";
      fee: number;
      totalCharged: number;
    }
  | { success: false; message: string }
> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };

    const parsed = initiateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }
    const phone = parseTopupMsisdn(parsed.data.msisdn);
    if (!phone.ok) return { success: false, message: phone.error };

    const feeResult = await getTransactionFee({
      amount: parsed.data.amount,
      type: "DEPOSIT",
    });
    if (!feeResult.success) {
      return {
        success: false,
        message: feeResult.message || "Fee calculation failed",
      };
    }
    const fee = feeResult.amount || 0;

    // Abuse guard: cap open deposits per user within the window; stuck rows
    // older than the window are handled by the expiry sweeper below.
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000,
    );
    const pendingCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "DEPOSIT",
        status: { in: ["PENDING", "INDETERMINATE"] },
        createdAt: { gt: windowStart },
      },
    });
    if (pendingCount >= MAX_PENDING_DEPOSITS) {
      return {
        success: false,
        message:
          "Too many pending deposits. Wait for them to complete and try again.",
      };
    }

    const method = methodLabelFor(phone.provider);
    const narrative = buildTopupNarrative(user.name);

    // Fail fast on APP_BASE_URL https / credential misconfig before
    // creating an orphan PENDING row.
    getYoWebhookUrls();
    getYoClient();

    // Persist FIRST — webhooks/polling correlate on externalReference.
    // Retry on reference collision (TX_ + 12 chars makes this near-impossible,
    // but a retry is cheaper than a failed deposit).
    let externalRef = "";
    let persisted = false;
    for (let attempt = 0; attempt < 3 && !persisted; attempt += 1) {
      externalRef = await generateTxRef();
      try {
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId: user.id,
              recipientId: user.id,
              displayName: user.name || "User",
              amount: parsed.data.amount,
              currency: "UGX",
              type: "DEPOSIT",
              status: "PENDING",
              category: "Deposit",
              method,
              txn_ref: externalRef,
              externalReference: externalRef,
              msisdn: phone.msisdn,
              provider: phone.provider,
              fee,
              reason: "Mobile Money Deposit",
            },
          }),
          prisma.processedTransaction.create({
            data: { externalReference: externalRef },
          }),
        ]);
        persisted = true;
      } catch (error) {
        if (
          attempt < 2 &&
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002"
        ) {
          continue;
        }
        console.error("yo initiate persist failed", { error });
        return {
          success: false,
          message: "Could not start deposit. Please try again.",
        };
      }
    }
    if (!persisted) {
      return {
        success: false,
        message: "Could not start deposit. Please try again.",
      };
    }

    const total = parsed.data.amount + fee;
    try {
      const api = getYoClient();
      configureDepositRequest(api, externalRef);
      const res = await api.acDepositFunds(
        phone.msisdn,
        total,
        narrative,
      );
      if (res.Status === "OK") {
        if (res.TransactionReference) {
          // Gated sync: skip silently if already settled terminally.
          await prisma.$transaction([
            prisma.transaction.updateMany({
              where: {
                externalReference: externalRef,
                status: { in: ["PENDING", "INDETERMINATE"] },
              },
              data: { providerRef: res.TransactionReference },
            }),
            prisma.processedTransaction.updateMany({
              where: { externalReference: externalRef, processed: false },
              data: { transactionReference: res.TransactionReference },
            }),
          ]);
        }
        // PENDING here is the normal non-blocking outcome: prompt sent,
        // awaiting the subscriber's PIN. Final state via IPN/polling/cron.
        return {
          success: true,
          externalRef,
          provider: phone.provider,
          fee,
          totalCharged: total,
        };
      }
      await finalizeYoFailure(externalRef);
      return {
        success: false,
        message: res.ErrorMessage || "Deposit rejected. Please try again.",
      };
    } catch (error) {
      // Transport failure (timeout/network): gateway state unknown.
      // Leave PENDING — IPN / polling / cron will resolve it.
      if (error instanceof YoAPIError) {
        console.error("yo deposit transport error", {
          externalRef,
          message: error.message,
        });
        return {
          success: true,
          externalRef,
          provider: phone.provider,
          fee,
          totalCharged: total,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error initiating Yo deposit:", error);
    return { success: false, message: "Could not start deposit" };
  }
};

// ---------------------------------------------------------------------------
// Status: light poll for the 3-minute UI (+ opportunistic settlement)
// ---------------------------------------------------------------------------

export const checkYoDepositStatus = async (
  externalRef: string,
): Promise<
  | {
      success: true;
      status: YoTopupStatus;
      amount: number;
      fee: number;
      providerRef: string | null;
    }
  | { success: false; message: string }
> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };
    if (!externalRef) return { success: false, message: "Missing reference" };

    const [guard, txn] = await Promise.all([
      prisma.processedTransaction.findUnique({
        where: { externalReference: externalRef },
      }),
      prisma.transaction.findUnique({
        where: { externalReference: externalRef },
      }),
    ]);
    if (!txn || !guard) {
      return { success: false, message: "Not found or unauthorized" };
    }
    if (txn.userId !== user.id && txn.recipientId !== user.id) {
      return { success: false, message: "Not found or unauthorized" };
    }

    const local = {
      success: true as const,
      amount: txn.amount.toNumber(),
      fee: txn.fee.toNumber(),
      providerRef: txn.providerRef,
    };
    if (guard.processed || txn.status === "COMPLETED") {
      return { ...local, status: "COMPLETED" };
    }
    if (txn.status === "FAILED") {
      return { ...local, status: "FAILED" };
    }

    // Still open — ask the provider (branch on TransactionStatus, not Status:
    // a failed poll reports Status ERROR/Code 2 with TransactionStatus FAILED).
    try {
      const api = getYoClient({ timeoutMs: STATUS_POLL_TIMEOUT_MS });
      const st = await api.acTransactionCheckStatus(null, externalRef);
      if (st.TransactionReference && st.TransactionReference !== txn.providerRef) {
        // Gated sync: skip silently if already settled terminally.
        await prisma.$transaction([
          prisma.transaction.updateMany({
            where: {
              externalReference: externalRef,
              status: { in: ["PENDING", "INDETERMINATE"] },
            },
            data: { providerRef: st.TransactionReference },
          }),
          prisma.processedTransaction.updateMany({
            where: { externalReference: externalRef, processed: false },
            data: { transactionReference: st.TransactionReference },
          }),
        ]);
      }
      if (st.TransactionStatus === "SUCCEEDED") {
        const settled = await finalizeYoSuccess({
          externalRef,
          gatewayAmount: st.Amount ?? null,
          gatewayRef: st.TransactionReference ?? null,
        });
        if (!settled.applied) {
          // amount-unknown → still recoverable via cron; mismatches and
          // races resolve to the locally stored terminal state.
          if (settled.reason === "amount-unknown") {
            return { ...local, status: "PENDING" };
          }
          const fresh = await prisma.transaction.findUnique({
            where: { externalReference: externalRef },
            select: { status: true },
          });
          const status =
            fresh?.status === "COMPLETED"
              ? "COMPLETED"
              : fresh?.status === "FAILED"
                ? "FAILED"
                : "PENDING";
          return { ...local, status };
        }
        return { ...local, status: "COMPLETED" };
      }
      if (st.TransactionStatus === "FAILED") {
        await finalizeYoFailure(externalRef);
        return { ...local, status: "FAILED" };
      }
      if (st.TransactionStatus === "INDETERMINATE") {
        return { ...local, status: "INDETERMINATE" };
      }
      return { ...local, status: "PENDING" };
    } catch (error) {
      if (error instanceof YoAPIError) {
        return { ...local, status: "PENDING" };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error checking Yo deposit status:", error);
    return { success: false, message: "Could not check status" };
  }
};
