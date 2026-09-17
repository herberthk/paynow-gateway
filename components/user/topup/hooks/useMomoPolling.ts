"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { checkYoDepositStatus } from "@/lib/actions/yo";
import {
  POLL_DEADLINE_MS,
  POLL_START_DELAY_MS,
  POLL_MAX_DELAY_MS,
  POLL_BACKOFF,
  withJitter,
} from "@/lib/yo/constants";
import type { MomoPhase } from "../types";

interface UseMomoPollingOptions {
  onClearError?: () => void;
  successRedirectPath?: string;
}

export function useMomoPolling({
  onClearError,
  successRedirectPath = "/dashboard/user/wallet/topup/success",
}: UseMomoPollingOptions = {}) {
  const router = useRouter();

  const [momoPhase, setMomoPhase] = useState<MomoPhase>("confirm");
  const [externalRef, setExternalRef] = useState<string>("");
  const [pollStartedAt, setPollStartedAt] = useState<number>(0);
  const [pollWindowCount, setPollWindowCount] = useState<number>(0);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActive = useRef(false);

  // Store latest router in a ref so pollStatusRef can close over it without deps.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const stopPolling = useCallback(() => {
    pollingActive.current = false;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingActive.current = false;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  /**
   * Stable ref to the poll loop — avoids the circular useCallback dependency
   * where pollStatus would need itself in its deps array.
   * The ref always points to the latest version so stale closures are not an issue.
   */
  const pollStatusRef = useRef<((ref: string, attemptStart: number, delay: number) => Promise<void>) | undefined>(undefined);

  /**
   * useLayoutEffect (no deps) = runs synchronously after every render.
   * This is the React-recommended "always-latest callback ref" pattern:
   * the ref is never stale, and writing it here (not during render) satisfies
   * the react-hooks/refs lint rule.
   */
  useLayoutEffect(() => {
    pollStatusRef.current = async (ref: string, attemptStart: number, delay: number) => {
      if (!pollingActive.current) return;

      if (Date.now() - attemptStart >= POLL_DEADLINE_MS) {
        setMomoPhase("timeout");
        stopPolling();
        return;
      }

      try {
        const result = await checkYoDepositStatus(ref);
        if (!pollingActive.current) return;

        if (result.success && result.status === "COMPLETED") {
          stopPolling();
          routerRef.current.push(
            `${successRedirectPath}?ref=${encodeURIComponent(ref)}`
          );
          return;
        }

        if (result.success && result.status === "FAILED") {
          stopPolling();
          setMomoPhase("failed");
          return;
        }
        // PENDING / INDETERMINATE — keep waiting until the deadline.
      } catch (err) {
        console.error("Top-up polling error:", err);
      }

      if (!pollingActive.current) return;

      const nextDelay = Math.min(delay * POLL_BACKOFF, POLL_MAX_DELAY_MS);
      pollTimer.current = setTimeout(
        () => pollStatusRef.current?.(ref, attemptStart, nextDelay),
        withJitter(nextDelay)
      );
    };
  });

  const startPolling = useCallback(
    (ref: string, existingStartedAt?: number) => {
      stopPolling();
      pollingActive.current = true;
      setPollWindowCount((c) => c + 1);
      const startedAt = existingStartedAt ?? Date.now();
      setPollStartedAt(startedAt);
      pollTimer.current = setTimeout(
        () => pollStatusRef.current?.(ref, startedAt, POLL_START_DELAY_MS),
        withJitter(POLL_START_DELAY_MS)
      );
    },
    [stopPolling]
  );

  const enterMomoConfirm = useCallback(() => {
    onClearError?.();
    setMomoPhase("confirm");
  }, [onClearError]);

  const handleKeepWaiting = useCallback(() => {
    if (pollWindowCount >= 3) return;
    onClearError?.();
    const startedAt = Date.now();
    setPollStartedAt(startedAt);
    setMomoPhase("pending");
    if (externalRef) {
      startPolling(externalRef, startedAt);
    }
  }, [pollWindowCount, externalRef, startPolling, onClearError]);

  const handleCancelPending = useCallback(() => {
    stopPolling();
    enterMomoConfirm();
  }, [stopPolling, enterMomoConfirm]);

  const resetMomoState = useCallback(() => {
    stopPolling();
    setExternalRef("");
    setPollStartedAt(0);
    setPollWindowCount(0);
    setMomoPhase("confirm");
  }, [stopPolling]);

  return {
    momoPhase,
    setMomoPhase,
    externalRef,
    setExternalRef,
    pollStartedAt,
    setPollStartedAt,
    pollWindowCount,
    setPollWindowCount,
    startPolling,
    stopPolling,
    enterMomoConfirm,
    handleKeepWaiting,
    handleCancelPending,
    resetMomoState,
  };
}
