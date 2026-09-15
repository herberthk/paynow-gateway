"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { checkYoDepositStatus } from "@/lib/actions/yo";
import { getTransactionByRef } from "@/lib/actions/wallet";
import {
  POLL_DEADLINE_MS,
  POLL_START_DELAY_MS,
  POLL_MAX_DELAY_MS,
  POLL_BACKOFF,
  withJitter,
} from "@/lib/yo/constants";
import {
  DepositDisputedCard,
  DepositFailedCard,
  DepositTimeoutCard,
} from "@/components/user/DepositStatusCards";

interface TransactionWaiterProps {
  txnRef: string;
}

export default function TransactionWaiter({ txnRef }: TransactionWaiterProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<
    "waiting" | "failed" | "timeout" | "disputed"
  >("waiting");
  const sawLiveCompleted = useRef(false);
  const followUpCount = useRef(0);
  const MAX_POST_COMPLETED_TICKS = 4;

  useEffect(() => {
    // Reset phase for the new transaction reference.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("waiting");

    let cancelled = false;
    sawLiveCompleted.current = false;
    followUpCount.current = 0;
    const startedAt = Date.now();
    let delay = POLL_START_DELAY_MS;
    let localTimer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt >= POLL_DEADLINE_MS) {
        if (
          sawLiveCompleted.current &&
          followUpCount.current < MAX_POST_COMPLETED_TICKS
        ) {
          followUpCount.current += 1;
          if (cancelled) return;
          localTimer = setTimeout(poll, 3000);
          return;
        }
        setPhase("timeout");
        return;
      }
      try {
        const [liveSettled, localSettled] = await Promise.allSettled([
          checkYoDepositStatus(txnRef),
          getTransactionByRef({ reference: txnRef }),
        ]);
        if (cancelled) return;
        const live =
          liveSettled.status === "fulfilled" ? liveSettled.value : null;
        const local =
          localSettled.status === "fulfilled" ? localSettled.value : null;
        if (live?.success && live.status === "COMPLETED") {
          sawLiveCompleted.current = true;
        }
        const completed =
          (live?.success && live.status === "COMPLETED") ||
          (local?.success && local.transaction.status === "COMPLETED");
        if (completed) {
          router.refresh();
          // The DB write may not have landed yet when the live provider
          // flips to COMPLETED. Schedule follow-up polls so a
          // PENDING re-render (same txnRef, effect doesn't rerun) still
          // resolves instead of wedging the spinner forever.
          // Bounded: after the cap, fall through to the timeout card
          // rather than looping forever.
          followUpCount.current += 1;
          if (followUpCount.current > MAX_POST_COMPLETED_TICKS) {
            setPhase("timeout");
            return;
          }
          if (cancelled) return;
          const remaining = POLL_DEADLINE_MS - (Date.now() - startedAt);
          if (remaining > 0) {
            localTimer = setTimeout(poll, Math.min(3000, remaining));
          } else if (sawLiveCompleted.current) {
            localTimer = setTimeout(poll, 3000);
          }
          return;
        }
        const disputed =
          (live?.success && (live.status as string) === "INDETERMINATE") ||
          (local?.success &&
            (local.transaction.status as string) === "INDETERMINATE");
        if (disputed) {
          setPhase("disputed");
          return;
        }
        const failed =
          (live?.success && live.status === "FAILED") ||
          (local?.success && local.transaction.status === "FAILED");
        if (failed) {
          setPhase("failed");
          return;
        }
        // INDETERMINATE / PENDING keeps polling like PENDING.
      } catch (err) {
        console.error("Polling error:", err);
      }
      if (cancelled) return;
      delay = Math.min(delay * POLL_BACKOFF, POLL_MAX_DELAY_MS);
      localTimer = setTimeout(poll, withJitter(delay));
    };

    localTimer = setTimeout(poll, withJitter(POLL_START_DELAY_MS));
    return () => {
      cancelled = true;
      if (localTimer) clearTimeout(localTimer);
    };
  }, [txnRef, router]);

  if (phase === "disputed") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
        <DepositDisputedCard txnRef={txnRef} />
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
        <DepositFailedCard txnRef={txnRef} />
      </div>
    );
  }

  if (phase === "timeout") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
        <DepositTimeoutCard txnRef={txnRef} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full" />
        <Loader2
          size={80}
          role="status"
          aria-label="Confirming transaction"
          className="text-indigo-600 animate-spin absolute inset-0"
        />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Finalizing Transaction
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Please wait while we confirm your funds...
        </p>
      </div>
      <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
        <AlertCircle size={14} />
        Reference: <span className="font-mono">{txnRef}</span>
      </div>
    </div>
  );
}
