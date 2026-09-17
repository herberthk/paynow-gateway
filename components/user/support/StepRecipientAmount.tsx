"use client";

import { memo } from "react";
import {
  Smartphone,
  CreditCard,
  Wallet,
  Search,
  User as UserIcon,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatUgDisplay } from "@/lib/yo/phone";
import type { StepRecipientAmountProps, SupportPaymentMethod } from "./types";

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

export const StepRecipientAmount = memo(function StepRecipientAmount({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  selectedRecipient,
  onSelectRecipient,
  onClearRecipient,
  recipientPhone,
  onRecipientPhoneChange,
  recipientPhonePreview,
  isVerifyingRecipient,
  verifiedRecipient,
  recipientVerificationError,
  onRetryRecipientVerification,
  selectedMethod,
  onSelectMethod,
  amount,
  onAmountChange,
  walletBalance,
  payerPhone,
  onPayerPhoneChange,
  payerPhonePreview,
  isVerifyingPayer,
  verifiedPayer,
  payerVerificationError,
  onRetryPayerVerification,
  error,
  isLoading,
  canContinue,
  onContinue,
}: StepRecipientAmountProps) {
  const minAmount =
    selectedMethod === "card" ? 10000 : selectedMethod === "wallet" ? 1000 : 500;

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-10 shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Info size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Step 1: Recipient & Payment Details
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Select a verified user and your preferred payment option
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recipient Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Recipient User
          </label>

          {!selectedRecipient ? (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, email, or phone (e.g. 077...)"
                className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-12 pr-10 py-4 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 size={18} className="animate-spin text-indigo-500" />
                </div>
              )}

              {/* Search Results Dropdown */}
              {(searchResults.length > 0 ||
                (searchQuery.length >= 3 && !isSearching)) && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/60">
                  {searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => onSelectRecipient(res)}
                        className="w-full text-left px-5 py-3.5 hover:bg-indigo-50/50 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {res.name?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {res.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {res.email || res.tel || "User ID #" + res.id}
                            </p>
                          </div>
                        </div>
                        {res.tel && (
                          <span className="text-[11px] font-mono text-gray-400 font-semibold">
                            {res.tel}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <Search size={18} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        No users found
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Try a different name, email, or telephone number
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected User Badge */}
              <div className="flex items-center justify-between p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
                    {selectedRecipient.name?.charAt(0).toUpperCase() || <UserIcon size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-gray-900 dark:text-white text-base">
                        {selectedRecipient.name}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        Recipient
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {selectedRecipient.email || "No email on profile"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearRecipient}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="Change Recipient"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Recipient Mobile Verification Card */}
              {verifiedRecipient ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Verified Carrier Identity
                        </span>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                        {verifiedRecipient.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {formatUgDisplay(verifiedRecipient.msisdn)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                      verifiedRecipient.provider === "MTN"
                        ? "bg-yellow-400 text-yellow-950 border border-yellow-500/30 font-black"
                        : "bg-red-600 text-white border border-red-700 font-bold"
                    }`}
                  >
                    {verifiedRecipient.provider} {verifiedRecipient.provider === "MTN" ? "MoMo" : "Money"}
                  </span>
                </motion.div>
              ) : isVerifyingRecipient ? (
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Verifying recipient mobile identity on carrier network…
                  </p>
                </div>
              ) : (
                /* Recipient phone input if not on profile or needs verification */
                <div className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Recipient Mobile Money Number
                    </span>
                    {recipientPhonePreview.provider && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {recipientPhonePreview.provider} Network Detected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                    <span className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
                      🇺🇬 +256
                    </span>
                    <input
                      type="tel"
                      value={recipientPhone.startsWith("256") ? recipientPhone.slice(3) : recipientPhone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        onRecipientPhoneChange(raw ? `256${raw}` : "");
                      }}
                      placeholder="779123456"
                      maxLength={9}
                      className="w-full px-3 py-2 text-sm font-mono font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white"
                    />
                    {recipientPhone.length === 12 && (
                      <button
                        type="button"
                        onClick={() => onRetryRecipientVerification(recipientPhone)}
                        className="px-3 py-1 mr-1 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  {recipientVerificationError && (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1 font-medium">
                      <AlertCircle size={14} />
                      <span>{recipientVerificationError}</span>
                      <button
                        type="button"
                        onClick={() => onRetryRecipientVerification(recipientPhone)}
                        className="ml-auto underline cursor-pointer font-bold"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Method Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "wallet" as SupportPaymentMethod,
                name: "Wallet Balance",
                sub: `UGX ${walletBalance.toLocaleString()}`,
                icon: Wallet,
              },
              {
                id: "momo" as SupportPaymentMethod,
                name: "Mobile Money",
                sub: "MTN / Airtel",
                icon: Smartphone,
              },
              {
                id: "card" as SupportPaymentMethod,
                name: "Card (Stripe)",
                sub: "Visa / Mastercard",
                icon: CreditCard,
              },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectMethod(method.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedMethod === method.id
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "border-gray-100 dark:border-slate-800 text-gray-400 hover:border-indigo-200 dark:hover:border-slate-700"
                }`}
              >
                <method.icon size={26} className="mb-2" />
                <span className="font-bold text-xs tracking-tight text-center text-gray-900 dark:text-white">
                  {method.name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {method.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="support-amount"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Support Amount
            </label>
            <span className="text-xs text-gray-400">
              Min: UGX {minAmount.toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-600 font-black text-lg">
                UGX
              </span>
            </div>
            <input
              id="support-amount"
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              min={minAmount}
              className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-20 pr-6 py-5 text-3xl font-black focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onAmountChange(String(val))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  amount === String(val)
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-indigo-400"
                }`}
              >
                +{val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Payer Mobile Money Input & Verification Gate (when Momo is selected) */}
        {selectedMethod === "momo" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800/80"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="payer-phone"
                className="block text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Your Mobile Money Number{" "}
                <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
                  (Prompted for PIN)
                </span>
              </label>
              {payerPhonePreview.provider && (
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    payerPhonePreview.provider === "MTN"
                      ? "bg-yellow-400 text-yellow-950 font-black"
                      : "bg-red-600 text-white font-bold"
                  }`}
                >
                  {payerPhonePreview.provider}
                </span>
              )}
            </div>

            {/* Payer Phone Input with +256 prefix pill */}
            <div className="relative flex items-center rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
              <div className="flex items-center gap-1.5 pl-4 pr-3 py-4 border-r border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold text-sm select-none">
                <span>🇺🇬</span>
                <span>+256</span>
              </div>
              <input
                id="payer-phone"
                type="tel"
                value={payerPhone.startsWith("256") ? payerPhone.slice(3) : payerPhone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[\s\-().]/g, "");
                  const digits = raw.startsWith("+") ? raw.slice(1) : raw;
                  if (digits.startsWith("256")) {
                    onPayerPhoneChange(digits);
                  } else if (digits.startsWith("0") && digits.length > 1) {
                    onPayerPhoneChange(`256${digits.slice(1)}`);
                  } else {
                    onPayerPhoneChange(`256${digits}`);
                  }
                }}
                placeholder="779123456"
                inputMode="tel"
                maxLength={12}
                className="w-full bg-transparent text-gray-900 dark:text-white px-4 py-4 text-base font-mono font-bold focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
              {payerPhone && (
                <div className="pr-4 shrink-0">
                  {isVerifyingPayer ? (
                    <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : verifiedPayer ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : payerPhone.length === 12 ? (
                    <button
                      type="button"
                      onClick={() => onRetryPayerVerification(payerPhone)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 cursor-pointer"
                    >
                      Verify
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Payer Verified Card */}
            <AnimatePresence mode="wait">
              {isVerifyingPayer && (
                <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Verifying your mobile money number registration…
                  </p>
                </div>
              )}

              {!isVerifyingPayer && verifiedPayer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Payer Account Verified
                        </span>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                        {verifiedPayer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {formatUgDisplay(verifiedPayer.msisdn)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      verifiedPayer.provider === "MTN"
                        ? "bg-yellow-400 text-yellow-950 font-black"
                        : "bg-red-600 text-white font-bold"
                    }`}
                  >
                    {verifiedPayer.provider}
                  </span>
                </motion.div>
              )}

              {!isVerifyingPayer && payerVerificationError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Verification Failed</p>
                    <p>{payerVerificationError}</p>
                    <button
                      type="button"
                      onClick={() => onRetryPayerVerification(payerPhone)}
                      className="mt-1 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Retry Verification
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isVerifyingRecipient || isVerifyingPayer ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>Verifying Accounts…</span>
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
