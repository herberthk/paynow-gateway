"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export function DepositFailedCard({
  txnRef,
  onRetry,
  onSecondary,
  secondaryLabel = "Change Amount",
  description,
}: {
  txnRef: string;
  onRetry?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  description?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="text-center py-4">
      {reduceMotion ? (
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-600" />
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle size={40} className="text-red-600" />
        </motion.div>
      )}
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        Payment failed
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium">
        {description ?? (
          <>
            This deposit could not be completed. No money was deducted from
            your wallet.
          </>
        )}
      </p>
      <p className="text-xs text-gray-400 font-mono mb-8">
        Reference: {txnRef}
      </p>
      <div className="space-y-4">
        {onRetry ? (
          <button
            onClick={onRetry}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
          >
            Try Again
          </button>
        ) : (
          <Link
            href="/dashboard/user/wallet/topup"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all text-center"
          >
            Try Again
          </Link>
        )}
        {onSecondary ? (
          <button
            onClick={onSecondary}
            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            {secondaryLabel}
          </button>
        ) : (
          <Link
            href="/dashboard/user/wallet"
            className="block w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all text-center"
          >
            Back to Wallet
          </Link>
        )}
      </div>
    </div>
  );
}

export function DepositTimeoutCard({
  txnRef,
  onKeepWaiting,
  keepWaitingExhausted = false,
  description,
}: {
  txnRef: string;
  onKeepWaiting?: () => void;
  keepWaitingExhausted?: boolean;
  description?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="text-center py-4">
      {reduceMotion ? (
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock3 size={40} className="text-amber-600" />
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Clock3 size={40} className="text-amber-600" />
        </motion.div>
      )}
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        Still processing
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium leading-relaxed">
        {description ?? (
          <>
            We haven&apos;t received confirmation yet. If you approved the prompt,
            your wallet will be credited automatically — otherwise no money
            moves. We&apos;ll contact you within the next <strong>24 hours</strong>.
          </>
        )}
      </p>
      <p className="text-xs text-gray-400 font-mono mb-8">
        Reference: {txnRef}
      </p>
      <div className="space-y-4">
        <Link
          href="/dashboard/user/wallet"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-center"
        >
          <Wallet size={18} />
          Back to Wallet
        </Link>
        {onKeepWaiting ? (
          <button
            onClick={onKeepWaiting}
            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Keep Waiting
          </button>
        ) : keepWaitingExhausted ? (
          <>
            <button
              disabled
              aria-disabled="true"
              title="Maximum wait time reached — check your wallet or contact support"
              className="w-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
              <CheckCircle2 size={18} />
              Keep Waiting
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Maximum wait time reached. Please check your wallet for the
              credit or contact support if the funds have not arrived.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function DepositDisputedCard({ txnRef }: { txnRef: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="text-center py-4">
      {reduceMotion ? (
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-amber-600" />
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ShieldAlert size={40} className="text-amber-600" />
        </motion.div>
      )}
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        Payment under review
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium leading-relaxed">
        This payment is under review — please do not retry. Your wallet will
        be credited automatically if approved, otherwise no money moves.
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium">
        If you need help, contact support@connectappbiz.com
      </p>
      <p className="text-xs text-gray-400 font-mono mb-8">
        Reference: {txnRef}
      </p>
      <div className="space-y-4">
        <Link
          href="/dashboard/user/wallet"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-center"
        >
          <Wallet size={18} />
          Back to Wallet
        </Link>
      </div>
    </div>
  );
}

export function PollProgress({ value01 }: { value01: number }) {
  const clamped = Math.min(Math.max(value01, 0), 1);
  const pct = clamped * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="mb-2 h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden"
    >
      <div
        className="h-full bg-linear-to-r from-indigo-600 to-purple-600 rounded-full"
        style={{ width: `${pct}%`, transition: "width 1s linear" }}
      />
    </div>
  );
}
