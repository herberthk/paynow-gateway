"use client";

import { memo } from "react";
import { Wallet, Info } from "lucide-react";
import { formatUgDisplay } from "@/lib/yo/phone";
import type { TopupSummaryProps } from "./types";

export const TopupSummary = memo(function TopupSummary({
  step,
  selectedMethod,
  amount,
  fee,
  phonePreview,
  verifiedAccount,
}: TopupSummaryProps) {
  const parsedAmount = parseFloat(amount || "0") || 0;
  const total = parsedAmount + (step === 2 ? fee : 0);

  const methodDisplay =
    selectedMethod === "momo"
      ? phonePreview.provider
        ? `${phonePreview.provider === "MTN" ? "MTN" : "Airtel"} Mobile Money`
        : "Mobile Money"
      : "Card Payment";

  return (
    <div className="lg:col-span-2">
      <div className="sticky top-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-indigo-600" />
            Transaction Summary
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500 font-medium">
                Payment Method
              </span>
              <span className="text-gray-900 dark:text-white font-bold capitalize">
                {methodDisplay}
              </span>
            </div>

            {selectedMethod === "momo" && verifiedAccount && (
              <>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">Account Name</span>
                  <span className="text-gray-900 dark:text-white font-bold uppercase truncate max-w-[160px] text-right">
                    {verifiedAccount.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">Number</span>
                  <span className="text-gray-900 dark:text-white font-mono font-bold text-xs">
                    {formatUgDisplay(verifiedAccount.msisdn)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500 font-medium">
                Top Up Amount
              </span>
              <span className="text-gray-900 dark:text-white font-bold">
                UGX {parsedAmount.toLocaleString()}
              </span>
            </div>

            {step === 2 && (
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  System Fee <Info size={14} className="text-gray-400" />
                </span>
                <span className="text-indigo-600 font-bold">
                  + UGX {fee.toLocaleString()}
                </span>
              </div>
            )}

            <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-slate-800 mt-4">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">
                  Total to Pay
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                  UGX {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-start gap-3">
              <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                Funds will be available instantly in your wallet after
                successful authorization. A receipt will be sent to your
                registered email.
              </p>
            </div>
          )}
        </div>

        {/* Support Info */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-800/50">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
            Need help?
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            If you encounter any issues during the top-up process, please
            contact our support team at support@connectappbiz.com or use the
            live chat.
          </p>
        </div>
      </div>
    </div>
  );
});
