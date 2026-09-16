import "server-only";
import { NextResponse } from "next/server";
import { YoAPIError, type TransactionCheckStatusResponse } from "@herberthtk/yo-payments-api";
import prisma from "@/lib/prisma";
import { yoAPI } from "@/lib/yo/client";
import {
  STALE_MINUTES,
  RECONCILE_BATCH_SIZE,
  RECONCILE_CONCURRENCY,
  EXPIRE_AFTER_HOURS,
} from "@/lib/yo/constants";
import { cronSecretRequired, isCronAuthorized } from "@/lib/yo/cron-auth";
import { finalizeYoSuccess, finalizeYoFailure } from "@/lib/actions/yo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Sentinel for a lost expiry race — aborts the interactive tx. */
class ExpiryRace extends Error {
  constructor() {
    super("deposit already settled concurrently");
    this.name = "ExpiryRace";
  }
}

/**
 * Reconciliation worker (scheduler to call every 6 minutes — cron config
 * lives outside the app). Picks unprocessed references created at least
 * 6 minutes ago, re-checks them with the provider and settles our ledger.
 *
 * Auth is fail-closed: requires Authorization: Bearer <CRON_SECRET>.
 * Unauthenticated access is allowed only when ALLOW_UNAUTH_CRON === "true".
 */
export async function POST(req: Request) {
  if (cronSecretRequired()) {
    return NextResponse.json(
      { success: false, message: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }
  if (!isCronAuthorized(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const summary = {
    checked: 0,
    succeeded: 0,
    failed: 0,
    stillPending: 0,
    unknown: 0,
    errors: 0,
    expired: 0,
    cleaned: 0,
    amountUnknown: 0,
  };

  // Expiry sweeper for orphaned PENDING rows with no provider confirmation.
  const expireCutoff = new Date(
    Date.now() - EXPIRE_AFTER_HOURS * 60 * 60_000,
  );
  const orphans = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
      status: { in: ["PENDING", "INDETERMINATE"] },
      createdAt: { lte: expireCutoff },
      providerRef: null,
      externalReference: { not: null },
      provider: { not: null },
    },
    orderBy: { createdAt: "asc" },
    take: RECONCILE_BATCH_SIZE,
    select: { externalReference: true, userId: true },
  });

  // Bounded concurrency: chunked Promise.all so at most
  // RECONCILE_CONCURRENCY provider status checks run at once within
  // maxDuration=60. Per-item try/catch + summary counting preserved;
  // fresh client per item — YoAPI holds per-request state.
  const processOrphan = async (
    orphan: (typeof orphans)[number],
  ): Promise<void> => {
    const externalReference = orphan.externalReference;
    if (!externalReference) return;
    try {
      // Confirmation gate: only expire after two prior non-terminal
      // observations. Rows predating the checks column read as 0 via default.
      const guard = await prisma.processedTransaction.findUnique({
        where: { externalReference },
        select: { processed: true, checks: true },
      });
      if (!guard || guard.processed) return;
      const priorChecks = guard.checks ?? 0;
      // Final status check before expiring — never bury a debited payment.
      let st:TransactionCheckStatusResponse;
      try {
        st = await yoAPI.acTransactionCheckStatus(null, externalReference);
      } catch (statusError) {
        // Transport error — leave for the next run, do not expire
        // (no counter change).
        if (!(statusError instanceof YoAPIError)) {
          console.error("yo reconcile expire status check failed", {
            externalReference,
            error: statusError,
          });
        }
        summary.errors += 1;
        return;
      }
      if (st.TransactionStatus === "SUCCEEDED") {
        const settled = await finalizeYoSuccess({
          externalRef: externalReference,
          gatewayAmount: st.Amount ?? null,
          gatewayRef: st.TransactionReference ?? null,
        });
        if (settled.applied) summary.succeeded += 1;
        else if (settled.reason === "amount-unknown")
          summary.amountUnknown += 1;
        else summary.stillPending += 1;
        return;
      }
      if (st.TransactionStatus === "FAILED") {
        await finalizeYoFailure(externalReference);
        summary.failed += 1;
        return;
      }
      // Still PENDING/INDETERMINATE after a fresh check in the same run.
      // Record the observation; expire only when already confirmed twice.
      if (priorChecks < 2) {
        await prisma.processedTransaction.updateMany({
          where: { externalReference, processed: false },
          data: { checks: { increment: 1 }, lastCheckedAt: new Date() },
        });
        summary.stillPending += 1;
        return;
      }
      // Confirmed twice + still non-terminal — expire with no confirmation.
      await prisma.$transaction(async (tx) => {
        const marked = await tx.transaction.updateMany({
          where: {
            externalReference,
            status: { in: ["PENDING", "INDETERMINATE"] },
          },
          data: {
            status: "FAILED",
            reason: "Expired — no provider confirmation",
          },
        });
        if (marked.count > 1) {
          console.warn("yo settlement corruption: expire marked >1", {
            externalReference,
            count: marked.count,
          });
        }
        if (marked.count !== 1) throw new ExpiryRace();
        const claimed = await tx.processedTransaction.updateMany({
          where: { externalReference, processed: false },
          data: {
            processed: true,
            processedAt: new Date(),
            checks: { increment: 1 },
            lastCheckedAt: new Date(),
          },
        });
        if (claimed.count > 1) {
          console.warn("yo settlement corruption: expire claimed >1", {
            externalReference,
            count: claimed.count,
          });
        }
        if (claimed.count !== 1) throw new ExpiryRace();
        await tx.systemNotification.create({
          data: {
            fromUserId: orphan.userId,
            toUserId: orphan.userId,
            title: "Deposit Expired",
            message: `Your deposit ${externalReference} expired with no provider confirmation. No money was moved.`,
            type: "ALERT",
            path: `/dashboard/user/transactions?query=${encodeURIComponent(externalReference)}`,
          },
        });
      });
      summary.expired += 1;
    } catch (error) {
      if (error instanceof ExpiryRace) return;
      console.error("yo reconcile expire failed", {
        externalReference,
        error,
      });
      summary.errors += 1;
    }
  };

  for (let i = 0; i < orphans.length; i += RECONCILE_CONCURRENCY) {
    await Promise.all(
      orphans.slice(i, i + RECONCILE_CONCURRENCY).map(processOrphan),
    );
  }

  const cutoff = new Date(Date.now() - STALE_MINUTES * 60_000);
  const stale = await prisma.processedTransaction.findMany({
    where: { processed: false, createdAt: { lte: cutoff } },
    orderBy: { createdAt: "asc" },
    take: RECONCILE_BATCH_SIZE,
    select: { externalReference: true, createdAt: true },
  });

  const processStaleItem = async (
    item: (typeof stale)[number],
  ): Promise<void> => {
    summary.checked += 1;
    try {
      const txn = await prisma.transaction.findUnique({
        where: { externalReference: item.externalReference },
        select: { status: true },
      });
      if (!txn) {
        summary.unknown += 1;
        return;
      }
      if (txn.status !== "PENDING" && txn.status !== "INDETERMINATE") {
        await prisma.processedTransaction.updateMany({
          where: {
            externalReference: item.externalReference,
            processed: false,
          },
          data: { processed: true, processedAt: new Date() },
        });
        summary.cleaned += 1;
        return;
      }
      // Fresh client per item — YoAPI holds per-request state.
      const st = await yoAPI.acTransactionCheckStatus(
        null,
        item.externalReference,
      );
      if (st.TransactionStatus === "SUCCEEDED") {
        const settled = await finalizeYoSuccess({
          externalRef: item.externalReference,
          gatewayAmount: st.Amount ?? null,
          gatewayRef: st.TransactionReference ?? null,
        });
        if (settled.applied) summary.succeeded += 1;
        else if (settled.reason === "amount-unknown")
          summary.amountUnknown += 1;
        else summary.stillPending += 1;
      } else if (st.TransactionStatus === "FAILED") {
        await finalizeYoFailure(item.externalReference);
        summary.failed += 1;
      } else {
        // PENDING / INDETERMINATE — leave unprocessed for the next run.
        summary.stillPending += 1;
      }
    } catch (error) {
      // Transport error or settle failure — leave for the next run.
      if (!(error instanceof YoAPIError)) {
        console.error("yo reconcile item failed", {
          externalReference: item.externalReference,
          error,
        });
      }
      summary.errors += 1;
    }
  };

  for (let i = 0; i < stale.length; i += RECONCILE_CONCURRENCY) {
    await Promise.all(
      stale.slice(i, i + RECONCILE_CONCURRENCY).map(processStaleItem),
    );
  }

  return NextResponse.json({ success: true, ...summary });
}
