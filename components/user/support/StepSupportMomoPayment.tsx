"use client";

import { memo } from "react";
import {
  Smartphone,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Heart,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { formatUgDisplay } from "@/lib/yo/phone";
import {
  DepositFailedCard,
  DepositTimeoutCard,
} from "@/components/user/DepositStatusCards";
import { PollCountdown } from "@/components/user/topup/PollCountdown";
import type { StepSupportMomoPaymentProps } from "./types";

export const StepSupportMomoPayment = memo(function StepSupportMomoPayment({
  momoPhase,
  amount,
  fee,
  recipient,
  verifiedRecipient,
  verifiedPayer,
  payerPhonePreview,
  payerPhone,
  externalRef,
  pollStartedAt,
  pollWindowCount,
  isLoading,
  error,
  onAuthorize,
  onBackToStep1,
  onRetryConfirm,
  onKeepWaiting,
}: StepSupportMomoPaymentProps) {
  const reduceMotion = useReducedMotion();
  const parsedAmount = parseFloat(amount || "0");
  const totalAmount = parsedAmount + fee;
  const payerProvider = verifiedPayer?.provider || payerPhonePreview.provider;

  if (momoPhase === "confirm" || momoPhase === "sending") {
    return (
      <motion.div
        key="support-momo-confirm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Heart size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Confirm & Authorize Support
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Review verified recipient and payment details before authorizing the prompt
            </p>
          </div>
        </div>

        {/* Recipient Details Card */}
        <div className="bg-linear-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900/80 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 my-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 font-black">
                <UserCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Recipient Account
                  </span>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {verifiedRecipient?.name || recipient.name || "Recipient User"}
                </h3>
              </div>
            </div>

            {verifiedRecipient?.provider && (
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  verifiedRecipient.provider === "MTN"
                    ? "bg-yellow-400 text-yellow-950 border border-yellow-500/30"
                    : "bg-red-600 text-white border border-red-700"
                }`}
              >
                {verifiedRecipient.provider} {verifiedRecipient.provider === "MTN" ? "MoMo" : "Money"}
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Support Amount to be Credited:</span>
            <span className="font-black text-gray-900 dark:text-white text-sm">
              UGX {parsedAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payer Card */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/60 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Smartphone size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Payer Phone (USSD prompt)
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {verifiedPayer?.msisdn ? formatUgDisplay(verifiedPayer.msisdn) : payerPhone}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToStep1}
            disabled={momoPhase === "sending"}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Prompt Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-5 mb-8 flex gap-3.5">
          <Smartphone className="text-amber-600 shrink-0 mt-0.5" size={22} />
          <p className="text-amber-900 dark:text-amber-300 text-xs leading-relaxed font-medium">
            Ensure your phone is unlocked. You will receive a prompt to enter your MM PIN to authorize the transaction of{" "}
            <strong>UGX {totalAmount.toLocaleString()}</strong> for{" "}
            <strong>{recipient.name}</strong>.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={onAuthorize}
            disabled={isLoading || !payerPhone}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] cursor-pointer"
          >
            {momoPhase === "sending" ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              "Confirm & Authorize Payment"
            )}
          </button>

          <button
            type="button"
            onClick={onBackToStep1}
            disabled={momoPhase === "sending"}
            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer text-sm"
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
        key="support-momo-pending"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="text-center py-4"
      >
        {/* Pulsing visual */}
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
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 text-white">
            <Smartphone size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Check your phone
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">
          Enter your <strong>{payerProvider || "Mobile Money"} PIN</strong> to authorize
        </p>
        <p className="text-xl font-black text-gray-900 dark:text-white mb-6">
          UGX {totalAmount.toLocaleString()}
        </p>

        {/* Progress bar */}
        <PollCountdown
          key={`${externalRef}-${pollStartedAt}`}
          startedAt={pollStartedAt}
        />

        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 text-left mb-6">
          <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Waiting for payment authorization from{" "}
            <strong>
              {payerPhonePreview.msisdn ? formatUgDisplay(payerPhonePreview.msisdn) : payerPhone}
            </strong>
            . Reference: <span className="font-mono font-bold">{externalRef}</span>
          </p>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Wait for a final transaction status before changing support details"
          className="w-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-2xl opacity-60 cursor-not-allowed text-sm"
        >
          Payment Pending
        </button>
      </motion.div>
    );
  }

  if (momoPhase === "failed") {
    return (
      <motion.div
        key="support-momo-failed"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <DepositFailedCard
          txnRef={externalRef}
          onRetry={onRetryConfirm}
          onSecondary={onBackToStep1}
          secondaryLabel="Change Support Details"
          description="This support payment could not be completed. No money was deducted from the payer’s Mobile Money account."
        />
      </motion.div>
    );
  }

  if (momoPhase === "timeout") {
    return (
      <motion.div
        key="support-momo-timeout"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <DepositTimeoutCard
          txnRef={externalRef}
          keepWaitingExhausted={pollWindowCount >= 3}
          onKeepWaiting={pollWindowCount >= 3 ? undefined : onKeepWaiting}
          description={
            <>
              We haven&apos;t received confirmation yet. If the payment succeeds,
              the recipient&apos;s wallet will be credited automatically — otherwise
              no money moves. We&apos;ll contact you within the next <strong>24 hours</strong>.
            </>
          }
        />
      </motion.div>
    );
  }

  return null;
});
