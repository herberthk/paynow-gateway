"use client";

import { memo } from "react";
import { Info, Heart, ShieldCheck, User } from "lucide-react";
import { formatUgDisplay } from "@/lib/yo/phone";
import type { SupportSummaryProps } from "./types";

export const SupportSummary = memo(function SupportSummary({
  step,
  selectedRecipient,
  verifiedRecipient,
  selectedMethod,
  amount,
  fee,
  verifiedPayer,
  payerPhonePreview,
}: SupportSummaryProps) {
  const parsedAmount = parseFloat(amount || "0") || 0;
  const total = parsedAmount + (step === 2 ? fee : 0);

  const methodDisplay =
    selectedMethod === "momo"
      ? payerPhonePreview.provider
        ? `${payerPhonePreview.provider === "MTN" ? "MTN" : "Airtel"} Mobile Money`
        : "Mobile Money"
      : selectedMethod === "wallet"
        ? "Wallet Balance"
        : "Card Payment";

  return (
    <div className="lg:col-span-2">
      <div className="sticky top-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Heart size={20} className="text-indigo-600 dark:text-indigo-400" />
            Support Summary
          </h3>

          <div className="space-y-4">
            {/* Recipient Overview */}
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                Recipient
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <User size={16} />
                  </div>
                  <div className="truncate max-w-[140px]">
                    <p className="font-black text-sm text-gray-900 dark:text-white truncate">
                      {selectedRecipient ? selectedRecipient.name : "Not Selected"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {selectedRecipient?.email || selectedRecipient?.tel || "Choose a user"}
                    </p>
                  </div>
                </div>
                {verifiedRecipient && (
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      verifiedRecipient.provider === "MTN"
                        ? "bg-yellow-400 text-yellow-950"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {verifiedRecipient.provider}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500 font-medium">Payment Method</span>
              <span className="text-gray-900 dark:text-white font-bold capitalize">
                {methodDisplay}
              </span>
            </div>

            {/* Payer Account (if MoMo) */}
            {selectedMethod === "momo" && verifiedPayer && (
              <>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">Payer Account</span>
                  <span className="text-gray-900 dark:text-white font-bold uppercase truncate max-w-[160px] text-right text-xs">
                    {verifiedPayer.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">Payer Number</span>
                  <span className="text-gray-900 dark:text-white font-mono font-bold text-xs">
                    {formatUgDisplay(verifiedPayer.msisdn)}
                  </span>
                </div>
              </>
            )}

            {/* Support Amount */}
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500 font-medium">Support Amount</span>
              <span className="text-gray-900 dark:text-white font-bold">
                UGX {parsedAmount.toLocaleString()}
              </span>
            </div>

            {/* System Fee */}
            {step === 2 && (
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  System Fee <Info size={14} className="text-gray-400" />
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  + UGX {fee.toLocaleString()}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-slate-800 mt-4">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">
                  Total to Pay
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  UGX {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="mt-8 p-4 bg-indigo-50/80 dark:bg-indigo-900/15 rounded-2xl flex items-start gap-3 border border-indigo-100/60 dark:border-indigo-800/30">
              <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                Funds are credited directly to the recipient&apos;s wallet immediately after successful payment authorization.
              </p>
            </div>
          )}
        </div>

        {/* Support Reassurance Card */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-800/50">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
            <Heart size={16} className="text-pink-500" />
            Empowering Others
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Support payments are fast, verified, and transparent. The recipient receives an instant email confirmation and notification.
          </p>
        </div>
      </div>
    </div>
  );
});
