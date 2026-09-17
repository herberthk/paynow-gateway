"use client";

import { memo } from "react";
import { ArrowLeft } from "lucide-react";
import type { TopupHeaderProps } from "./types";

const STEPS = [
  { id: 1, label: "Amount" },
  { id: 2, label: "Payment" },
];

export const TopupHeader = memo(function TopupHeader({
  step,
  onBack,
}: TopupHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onBack}
          aria-label={step === 1 ? "Return to wallet" : "Back to amount entry"}
          className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-gray-500 shadow-sm border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group cursor-pointer"
        >
          <ArrowLeft
            size={22}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Recharge Wallet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Top up your balance instantly
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm">
        {STEPS.map((s) => (
          <div
            key={s.id}
            aria-current={step === s.id ? "step" : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 ${
              step === s.id
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm font-bold"
                : "text-gray-400 font-medium"
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                step === s.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-slate-800 text-gray-500"
              }`}
            >
              {s.id}
            </span>
            <span className="text-xs uppercase tracking-wider">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
