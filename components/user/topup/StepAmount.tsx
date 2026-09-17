"use client";

import { memo } from "react";
import {
  Smartphone,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MIN_TOPUP, MAX_TOPUP } from "@/lib/yo/constants";
import { formatUgDisplay } from "@/lib/yo/phone";
import type { StepAmountProps, PaymentMethod } from "./types";

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  name: string;
  icon: typeof Smartphone;
}> = [
  { id: "momo", name: "Mobile Money", icon: Smartphone },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
];

export const StepAmount = memo(function StepAmount({
  selectedMethod,
  onSelectMethod,
  amount,
  onAmountChange,
  phone,
  onPhoneChange,
  phonePreview,
  isVerifyingPhone,
  verifiedAccount,
  phoneVerificationError,
  onRetryVerification,
  error,
  isLoading,
  canContinue,
  onContinue,
}: StepAmountProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-10 shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
          <Info size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Step 1: Choose Amount
        </h2>
      </div>

      <div className="space-y-6">
        {/* Method Selection */}
        <div>
          <label
            id="payment-method-label"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"
          >
            Select Payment Method
          </label>
          <div
            role="group"
            aria-labelledby="payment-method-label"
            className="grid grid-cols-2 gap-4"
          >
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectMethod(method.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedMethod === method.id
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600"
                    : "border-gray-100 dark:border-slate-800 text-gray-400 hover:border-indigo-200 dark:hover:border-slate-700"
                }`}
              >
                <method.icon size={28} className="mb-2" />
                <span className="font-bold text-sm tracking-tight">
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label
            htmlFor="topup-amount"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"
          >
            Amount to Top Up
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-600 font-black text-lg">
                UGX
              </span>
            </div>
            <input
              id="topup-amount"
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              min={MIN_TOPUP}
              max={MAX_TOPUP}
              className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-20 pr-6 py-5 text-3xl font-black focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Mobile Money Phone Input & Verification Gate */}
        {selectedMethod === "momo" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="momo-phone"
                className="block text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Mobile Money Number{" "}
                <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
                  (Format: 256XXXXXXXXX)
                </span>
              </label>
              {phonePreview.provider && (
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    phonePreview.provider === "MTN"
                      ? "bg-yellow-700 dark:bg-yellow-900/40 text-yellow-400 dark:text-yellow-400"
                      : "bg-red-700 dark:bg-red-900/40 text-red-400 dark:text-red-400"
                  }`}
                >
                  {phonePreview.provider}
                </span>
              )}
            </div>

            {/* Phone Input with country code pill */}
            <div className="relative flex items-center rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
              <div className="flex items-center gap-1.5 pl-4 pr-3 py-4 border-r border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 select-none shrink-0 font-bold text-sm">
                <span className="text-base" role="img" aria-label="Uganda">
                  🇺🇬
                </span>
                <span>+256</span>
              </div>
              <input
                id="momo-phone"
                type="tel"
                value={phone.startsWith("256") ? phone.slice(3) : phone}
                onChange={(e) => {
                  // Strip everything that isn't a digit
                  const digits = e.target.value.replace(/\D/g, "");
                  if (digits.startsWith("256")) {
                    // Already has the country prefix — pass as-is
                    onPhoneChange(digits);
                  } else if (digits.startsWith("0") && digits.length > 1) {
                    // National "0779..." → strip leading zero, prefix 256
                    onPhoneChange(`256${digits.slice(1)}`);
                  } else {
                    onPhoneChange(`256${digits}`);
                  }
                }}
                placeholder="779159642"
                inputMode="tel"
                autoComplete="tel"
                maxLength={12}
                className="w-full bg-transparent text-gray-900 dark:text-white px-4 py-4 text-lg font-mono font-bold focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
              {phone && (
                <div className="pr-4 shrink-0">
                  {isVerifyingPhone ? (
                    <Loader2 size={20} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : verifiedAccount ? (
                    <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </span>
                  ) : phone.length === 12 ? (
                    <button
                      type="button"
                      onClick={() => onRetryVerification(phone)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 cursor-pointer"
                    >
                      Verify
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Helper indicator */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                Target MSISDN: <strong className="text-gray-700 dark:text-gray-300">{phone || "256XXXXXXXXX"}</strong>
              </span>
              {phone && phone.length < 12 && (
                <span className="text-amber-500 font-medium text-[11px]">
                  {12 - phone.length} digits needed
                </span>
              )}
            </div>

            {/* Live Verification State Display */}
            <AnimatePresence mode="wait">
              {isVerifyingPhone && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Loader2 size={18} className="animate-spin" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Verifying Account Registration…
                      </p>
                      <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
                        Checking official network records for {phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-200/50 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300">
                    Checking
                  </span>
                </motion.div>
              )}

              {!isVerifyingPhone && verifiedAccount && (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.97, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -6 }}
                  className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/5 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-indigo-950/30 p-5 shadow-lg shadow-emerald-500/5"
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            Verified Account Holder
                          </span>
                          <CheckCircle2 size={13} className="text-emerald-500" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">
                          {verifiedAccount.name}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shrink-0 shadow-xs ${
                        verifiedAccount.provider === "MTN"
                          ? "bg-yellow-400 text-yellow-950 border border-yellow-500/40 shadow-yellow-500/10"
                          : "bg-red-600 text-white border border-red-700 shadow-red-500/20"
                      }`}
                    >
                      {verifiedAccount.provider} {verifiedAccount.provider === "MTN" ? "Momo" : "Money"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-200">
                        {formatUgDisplay(verifiedAccount.msisdn)}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        ({verifiedAccount.msisdn})
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Registered & Validated
                    </span>
                  </div>
                </motion.div>
              )}

              {!isVerifyingPhone && phoneVerificationError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-4 bg-red-50/90 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-400 shadow-xs"
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="flex-1 text-xs leading-relaxed">
                    <p className="font-bold text-sm mb-0.5">Verification Failed</p>
                    <p className="text-red-600/90 dark:text-red-400/90">{phoneVerificationError}</p>
                    <button
                      type="button"
                      onClick={() => onRetryVerification(phone)}
                      className="mt-2 text-xs font-bold underline hover:no-underline text-red-700 dark:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Retry Verification
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <p id="topup-continue-hint" className="sr-only">
          Enter a valid amount and verified phone number to continue
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          aria-describedby="topup-continue-hint"
          title={
            isLoading
              ? "Processing payment details…"
              : isVerifyingPhone
                ? "Verifying phone number registration…"
                : selectedMethod === "momo" && !verifiedAccount
                  ? "Enter and verify a valid 12-digit Mobile Money number"
                  : !amount
                    ? "Enter an amount to continue"
                    : "Continue to payment"
          }
          className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? (
            <Loader2
              size={24}
              className="animate-spin"
              role="status"
              aria-label="Loading"
            />
          ) : isVerifyingPhone ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>Verifying Number…</span>
            </>
          ) : (
            <>
              Continue to Payment
              <ChevronRight
                size={22}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
});
