"use client";

import { memo } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import type { SupportHeaderProps } from "./types";

const STEPS = [
  { id: 1, label: "Details & Verification" },
  { id: 2, label: "Authorization" },
];

export const SupportHeader = memo(function SupportHeader({
  step,
  onBack,
  onViewHistory,
  backDisabled = false,
}: SupportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          aria-label={step === 1 ? "Return to wallet" : "Back to step 1"}
          className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-gray-500 shadow-sm border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft
            size={22}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Support a User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Send financial support securely with real-time verification
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-gray-100/60 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          {STEPS.map((s) => (
            <div
              key={s.id}
              aria-current={step === s.id ? "step" : undefined}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 ${
                step === s.id
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm font-bold"
                  : "text-gray-400 font-medium"
              }`}
            >
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  step === s.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-slate-800 text-gray-500"
                }`}
              >
                {s.id}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* History Action */}
        <button
          type="button"
          onClick={onViewHistory}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold text-xs rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
          History
        </button>
      </div>
    </div>
  );
});
