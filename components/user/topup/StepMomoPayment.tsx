"use client";

import { memo } from "react";
import {
  Smartphone,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { formatUgDisplay } from "@/lib/yo/phone";
import {
  DepositFailedCard,
  DepositTimeoutCard,
} from "@/components/user/DepositStatusCards";
import { PollCountdown } from "./PollCountdown";
import type { StepMomoPaymentProps } from "./types";

export const StepMomoPayment = memo(function StepMomoPayment({
  momoPhase,
  amount,
  fee,
  verifiedAccount,
  phonePreview,
  phone,
  externalRef,
  pollStartedAt,
  pollWindowCount,
  isLoading,
  error,
  onAuthorize,
  onBackToStep1,
  onCancelPending,
  onRetryConfirm,
  onKeepWaiting,
}: StepMomoPaymentProps) {
  const reduceMotion = useReducedMotion();
  const parsedAmount = parseFloat(amount || "0");
  const totalAmount = parsedAmount + fee;
  const provider = verifiedAccount?.provider || phonePreview.provider;

  if (momoPhase === "confirm" || momoPhase === "sending") {
    return (
      <motion.div
        key="momo-confirm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm & Authorize
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
          Review your verified recipient account before authorizing the PIN prompt.
        </p>

        {/* Verified Account Banner */}
        <div className="bg-linear-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900/80 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <UserCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Verified Account Holder
                  </span>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">
                  {verifiedAccount?.name || "Verified Account"}
                </h3>
              </div>
            </div>
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs shrink-0 ${
                provider === "MTN"
                  ? "bg-yellow-400 text-yellow-950 font-black border border-yellow-500/30"
                  : "bg-red-600 text-white font-bold border border-red-700"
              }`}
            >
              {provider} {provider === "MTN" ? "MoMo" : "Money"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Smartphone size={15} className="text-gray-400" />
              <span className="font-mono font-bold">
                {verifiedAccount?.msisdn ? formatUgDisplay(verifiedAccount.msisdn) : phone}
              </span>
              <span className="text-[10px] text-gray-400">
                ({verifiedAccount?.msisdn || phone})
              </span>
            </div>
            <button
              type="button"
              onClick={onBackToStep1}
              disabled={momoPhase === "sending"}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6 mb-8 flex gap-4">
          <Smartphone
            className="text-amber-600 shrink-0"
            size={24}
          />
          <p className="text-amber-900 dark:text-amber-400 text-sm leading-relaxed font-medium">
            Ensure your phone is unlocked. You will receive a
            prompt to enter your MM PIN to authorize the
            transaction of{" "}
            <strong>
              UGX {totalAmount.toLocaleString()}
            </strong>
            .
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <p id="momo-confirm-hint" className="sr-only">
            Enter a valid MTN or Airtel number and amount to authorize
          </p>
          <button
            type="button"
            onClick={onAuthorize}
            disabled={isLoading || !verifiedAccount || !amount}
            aria-describedby="momo-confirm-hint"
            title={
              isLoading
                ? "Sending payment prompt…"
                : !verifiedAccount
                  ? "Please verify your mobile number in Step 1 first"
                  : !amount
                    ? "Enter an amount to continue"
                    : "Confirm and authorize payment"
            }
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] cursor-pointer"
          >
            {momoPhase === "sending" ? (
              <Loader2
                size={24}
                className="animate-spin"
                role="status"
                aria-label="Sending payment prompt"
              />
            ) : (
              "Confirm & Authorize"
            )}
          </button>
          <button
            type="button"
            onClick={onBackToStep1}
            disabled={momoPhase === "sending"}
            title={
              momoPhase === "sending"
                ? "Please wait while the payment prompt is being sent"
                : "Go back to amount entry"
            }
            aria-disabled={momoPhase === "sending"}
            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  if (momoPhase === "pending") {
    return (
      <motion.div
        key="momo-pending"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="text-center py-4"
      >
        {/* Animated prompt visual */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          {reduceMotion ? (
            <>
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 scale-1" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/15 scale-1" />
            </>
          ) : (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/10"
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/15"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </>
          )}
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Smartphone size={40} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Check your phone
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">
          Enter your{" "}
          <strong>
            {phonePreview.provider} PIN
          </strong>{" "}
          to authorize
        </p>
        <p className="text-xl font-black text-gray-900 dark:text-white mb-6">
          UGX {totalAmount.toLocaleString()}
        </p>

        {/* Progress */}
        <PollCountdown
          key={`${externalRef}-${pollStartedAt}`}
          startedAt={pollStartedAt}
        />

        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 text-left mb-6">
          <ShieldCheck size={20} className="text-green-600 shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Waiting for {phonePreview.provider} confirmation on{" "}
            <strong>
              {phonePreview.msisdn
                ? formatUgDisplay(phonePreview.msisdn)
                : phone}
            </strong>
            . Reference{" "}
            <span className="font-mono font-bold">
              {externalRef}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onCancelPending}
          className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </motion.div>
    );
  }

  if (momoPhase === "failed") {
    return (
      <motion.div
        key="momo-failed"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <DepositFailedCard
          txnRef={externalRef}
          onRetry={onRetryConfirm}
          onSecondary={onBackToStep1}
          secondaryLabel="Change Amount"
        />
      </motion.div>
    );
  }

  if (momoPhase === "timeout") {
    return (
      <motion.div
        key="momo-timeout"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <DepositTimeoutCard
          txnRef={externalRef}
          keepWaitingExhausted={pollWindowCount >= 3}
          onKeepWaiting={pollWindowCount >= 3 ? undefined : onKeepWaiting}
        />
      </motion.div>
    );
  }

  return null;
});
