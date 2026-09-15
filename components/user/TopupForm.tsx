"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Info,
  Wallet,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/global/StripePaymentForm";
import type { Appearance } from "@stripe/stripe-js";
import { getTransactionFee } from "@/lib/actions/fee";
import { createPaymentIntent } from "@/lib/actions/stripe";
import {
  initiateYoDeposit,
  checkYoDepositStatus,
} from "@/lib/actions/yo";
import {
  normalizeUgMsisdn,
  detectProvider,
  formatUgDisplay,
} from "@/lib/yo/phone";
import {
  MIN_TOPUP,
  MAX_TOPUP,
  POLL_DEADLINE_MS,
  POLL_START_DELAY_MS,
  POLL_MAX_DELAY_MS,
  POLL_BACKOFF,
  withJitter,
} from "@/lib/yo/constants";
import {
  DepositFailedCard,
  DepositTimeoutCard,
  PollProgress,
} from "@/components/user/DepositStatusCards";

type MomoPhase = "confirm" | "sending" | "pending" | "failed" | "timeout";

const PollCountdown = memo(function PollCountdown({
  startedAt,
}: {
  startedAt: number;
}) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const progress = Math.min(elapsed / POLL_DEADLINE_MS, 1);
  const remainingSecs = Math.max(
    0,
    Math.ceil((POLL_DEADLINE_MS - elapsed) / 1000),
  );
  return (
    <>
      <PollProgress value01={progress} />
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium mb-6"
      >
        <Clock3 size={14} />
        Confirming… {Math.floor(remainingSecs / 60)}:
        {String(remainingSecs % 60).padStart(2, "0")} remaining
      </div>
    </>
  );
});

const TopupForm = ({ initialPhone = "" }: { initialPhone?: string }) => {
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<string>("momo");
  const [step, setStep] = useState(1); // 1: Input, 2: Payment
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [stripePromise] = useState(() => getStripe());

  // MoMo real-money state
  const [phone, setPhone] = useState<string>(initialPhone);
  const [momoPhase, setMomoPhase] = useState<MomoPhase>("confirm");
  const [externalRef, setExternalRef] = useState<string>("");
  const [pollStartedAt, setPollStartedAt] = useState<number>(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActive = useRef(false);
  const [pollWindowCount, setPollWindowCount] = useState(0);
  const reduceMotion = useReducedMotion();

  const phonePreview = useMemo(() => {
    const normalized = normalizeUgMsisdn(phone);
    if (!normalized.ok) return { msisdn: null as string | null, provider: null as "MTN" | "AIRTEL" | null, error: normalized.error };
    return {
      msisdn: normalized.msisdn,
      provider: detectProvider(normalized.msisdn),
      error: null as string | null,
    };
  }, [phone]);

  const stripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? "",
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#0f172a",
          colorText: "#ffffff",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "16px",
        },
        rules: {
          ".Input": {
            border: "1px solid #1e293b",
            backgroundColor: "#1e293b",
            padding: "12px",
          },
        },
      } as Appearance,
    }),
    [clientSecret],
  );

  const stopPolling = () => {
    pollingActive.current = false;
    if (pollTimer.current) clearTimeout(pollTimer.current);
  };

  useEffect(() => stopPolling, []);

  const goBackToStep1 = () => {
    setError(null);
    setFee(0);
    setStep(1);
  };

  const enterMomoConfirm = () => {
    setError(null);
    setMomoPhase("confirm");
  };

  const pollStatus = async (ref: string, attemptStart: number, delay: number) => {
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
        router.push(
          `/dashboard/user/wallet/topup/success?ref=${encodeURIComponent(ref)}`,
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
      () => pollStatus(ref, attemptStart, nextDelay),
      withJitter(nextDelay),
    );
  };

  const startPolling = (ref: string, existingStartedAt?: number) => {
    stopPolling();
    pollingActive.current = true;
    setPollWindowCount((c) => c + 1);
    const startedAt = existingStartedAt ?? Date.now();
    setPollStartedAt(startedAt);
    pollTimer.current = setTimeout(
      () => pollStatus(ref, startedAt, POLL_START_DELAY_MS),
      withJitter(POLL_START_DELAY_MS),
    );
  };

  const handleContinue = async () => {
    const rawAmount = amount.trim();
    if (!/^\d+$/.test(rawAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }
    const depositAmount = Number(rawAmount);

    if (isNaN(depositAmount) || depositAmount < MIN_TOPUP) {
      setError(`Minimum deposit is UGX ${MIN_TOPUP.toLocaleString()}`);
      return;
    }
    if (depositAmount > MAX_TOPUP) {
      setError(`Maximum deposit is UGX ${MAX_TOPUP.toLocaleString()}`);
      return;
    }
    if (!Number.isInteger(depositAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feeResult = await getTransactionFee({
        amount: depositAmount,
        type: "DEPOSIT",
      });

      if (!feeResult.success) {
        setError(feeResult.message || "Fee calculation failed");
        return;
      }

      setFee(feeResult.amount || 0);

      if (selectedMethod === "card") {
        const totalAmount = depositAmount + (feeResult?.amount || 0);
        const stripeResult = await createPaymentIntent({
          amount: totalAmount,
          baseAmount: depositAmount,
          type: "wallet_topup",
        });

        if (!stripeResult.clientSecret) {
          setError("Failed to initialize payment");
          return;
        }

        setClientSecret(stripeResult.clientSecret || null);
        setTxRef(stripeResult.transactionReference || "");
        setError(null);
        setStep(2);
      } else {
        setError(null);
        setMomoPhase("confirm");
        setStep(2);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMomoPayment = async () => {
    const rawMomoAmount = amount.trim();
    if (!/^\d+$/.test(rawMomoAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }
    const momoAmount = Number(rawMomoAmount);
    if (isNaN(momoAmount) || momoAmount < MIN_TOPUP) {
      setError(`Minimum deposit is UGX ${MIN_TOPUP.toLocaleString()}`);
      return;
    }
    if (momoAmount > MAX_TOPUP) {
      setError(`Maximum deposit is UGX ${MAX_TOPUP.toLocaleString()}`);
      return;
    }
    if (!Number.isInteger(momoAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }
    if (!phonePreview.msisdn || !phonePreview.provider) {
      setError(
        phonePreview.error ||
          "Only MTN and Airtel Uganda numbers are supported",
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    setMomoPhase("sending");
    try {
      const result = await initiateYoDeposit({
        amount: momoAmount,
        msisdn: phonePreview.msisdn,
      });

      if (result.success && result.externalRef) {
        const startedAt = Date.now();
        setPollStartedAt(startedAt);
        setExternalRef(result.externalRef);
        setMomoPhase("pending");
        setPollWindowCount(0);
        startPolling(result.externalRef, startedAt);
      } else {
        setMomoPhase("confirm");
        setError(
          (!result.success && result.message) ||
            "Mobile Money payment failed",
        );
      }
    } catch (err: unknown) {
      console.error("Momo payment error:", err);
      setMomoPhase("confirm");
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-transparent">
      {/* Header & Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <button
            onClick={() =>
              step === 1 ? router.push("/dashboard/user/wallet") : goBackToStep1()
            }
            className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-gray-500 shadow-sm border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all active:scale-95 group"
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

        {/* Improved Step Indicator */}
        <div className="flex items-center gap-3 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          {[
            { id: 1, label: "Amount" },
            { id: 2, label: "Payment" },
          ].map((s) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 1 ? (
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
                      {[
                        { id: "momo", name: "Mobile Money", icon: Smartphone },
                        {
                          id: "card",
                          name: "Credit/Debit Card",
                          icon: CreditCard,
                        },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => {
                            setSelectedMethod(method.id);
                            setClientSecret(null);
                            setTxRef("");
                            setExternalRef("");
                          }}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
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
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-gray-400 dark:text-gray-600 font-black text-lg">
                          UGX
                        </span>
                      </div>
                      <input
                        id="topup-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="0"
                        inputMode="numeric"
                        min={MIN_TOPUP}
                        max={MAX_TOPUP}
                        className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-20 pr-6 py-5 text-3xl font-black focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      />
                    </div>
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
                  </div>

                  <p id="topup-continue-hint" className="sr-only">
                    Enter a valid amount of at least UGX 1,000 to continue
                  </p>
                  <button
                    onClick={handleContinue}
                    disabled={isLoading || !amount}
                    aria-describedby="topup-continue-hint"
                    title={
                      isLoading
                        ? "Processing payment details…"
                        : !amount
                          ? "Enter an amount to continue"
                          : "Continue to payment"
                    }
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2
                        size={24}
                        className="animate-spin"
                        role="status"
                        aria-label="Loading"
                      />
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
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800"
              >
                {selectedMethod === "card" && clientSecret ? (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Secure Card Payment
                    </h2>
                    <Elements
                      stripe={stripePromise}
                      options={stripeElementsOptions}
                    >
                      <StripePaymentForm
                        amount={parseFloat(amount || "0")}
                        transactionReference={txRef}
                        onCancel={goBackToStep1}
                        onSuccess={(reference) => {
                          router.push(
                            `/dashboard/user/wallet/topup/success?ref=${encodeURIComponent(reference)}`,
                          );
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {(momoPhase === "confirm" || momoPhase === "sending") && (
                      <motion.div
                        key="momo-confirm"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                      >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                          Confirm Mobile Money
                        </h2>

                        {/* Phone input with live provider badge */}
                        <div className="mb-6">
                          <label
                            htmlFor="momo-phone"
                            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"
                          >
                            Mobile Money Number
                          </label>
                          <div className="relative">
                            <Smartphone
                              size={20}
                              aria-hidden="true"
                              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              id="momo-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (error) setError(null);
                              }}
                              placeholder="0777123456"
                              inputMode="tel"
                              autoComplete="tel"
                              maxLength={20}
                              disabled={momoPhase === "sending"}
                              className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-12 pr-28 py-4 text-lg font-bold focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 placeholder:font-medium"
                            />
                            <AnimatePresence>
                              {phonePreview.provider && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                                    phonePreview.provider === "MTN"
                                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {phonePreview.provider}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <div aria-live="polite">
                            {phonePreview.msisdn ? (
                              <p className="mt-2 text-xs text-gray-500 font-medium">
                                {formatUgDisplay(phonePreview.msisdn)} ·{" "}
                                {phonePreview.provider}
                              </p>
                            ) : (
                              phone.trim() !== "" && (
                                <p
                                  role="alert"
                                  className="mt-2 text-xs text-red-500 font-medium"
                                >
                                  {phonePreview.error}
                                </p>
                              )
                            )}
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
                              UGX{" "}
                              {(
                                parseFloat(amount || "0") + fee
                              ).toLocaleString()}
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
                            Enter a valid MTN or Airtel number and amount to
                            authorize
                          </p>
                          <button
                            onClick={handleMomoPayment}
                            disabled={
                              isLoading || !phonePreview.provider || !amount
                            }
                            aria-describedby="momo-confirm-hint"
                            title={
                              isLoading
                                ? "Sending payment prompt…"
                                : !phonePreview.provider
                                  ? "Enter a valid MTN or Airtel number"
                                  : !amount
                                    ? "Enter an amount to continue"
                                    : "Confirm and authorize payment"
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
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
                            onClick={goBackToStep1}
                            disabled={momoPhase === "sending"}
                            title={
                              momoPhase === "sending"
                                ? "Please wait while the payment prompt is being sent"
                                : "Go back to amount entry"
                            }
                            aria-disabled={momoPhase === "sending"}
                            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50"
                          >
                            Go Back
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {momoPhase === "pending" && (
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
                          UGX {(parseFloat(amount || "0") + fee).toLocaleString()}
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
                          onClick={() => {
                            stopPolling();
                            enterMomoConfirm();
                          }}
                          className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}

                    {momoPhase === "failed" && (
                      <motion.div
                        key="momo-failed"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                      >
                        <DepositFailedCard
                          txnRef={externalRef}
                          onRetry={enterMomoConfirm}
                          onSecondary={goBackToStep1}
                          secondaryLabel="Change Amount"
                        />
                      </motion.div>
                    )}

                    {momoPhase === "timeout" && (
                      <motion.div
                        key="momo-timeout"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                      >
                        <DepositTimeoutCard
                          txnRef={externalRef}
                          keepWaitingExhausted={
                            pollWindowCount >= 3
                          }
                          onKeepWaiting={
                            pollWindowCount >= 3
                              ? undefined
                              : () => {
                                  setError(null);
                                  const startedAt = Date.now();
                                  setPollStartedAt(startedAt);
                                  setMomoPhase("pending");
                                  if (externalRef)
                                    startPolling(externalRef, startedAt);
                                }
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Summary */}
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
                    {selectedMethod === "momo"
                      ? phonePreview.provider
                        ? `${phonePreview.provider === "MTN" ? "MTN" : "Airtel"} Mobile Money`
                        : "Mobile Money"
                      : "Card Payment"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">
                    Top Up Amount
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    UGX {parseFloat(amount || "0").toLocaleString()}
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
                      UGX{" "}
                      {(
                        parseFloat(amount || "0") + (step === 2 ? fee : 0)
                      ).toLocaleString()}
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
      </div>
    </div>
  );
};

export default TopupForm;
