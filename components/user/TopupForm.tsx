"use client";

import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processMobileMoneyDeposit } from "@/lib/actions/wallet";
import { getTransactionFee } from "@/lib/actions/fee";
import { createPaymentIntent } from "@/lib/actions/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/global/StripePaymentForm";
import type { Appearance } from "@stripe/stripe-js";

const TopupForm = () => {
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

  const handleContinue = async () => {
    const depositAmount = parseFloat(amount);
    const minAmount = selectedMethod === "card" ? 10000 : 500; // Increased card minimum for Stripe

    if (isNaN(depositAmount) || depositAmount < minAmount) {
      setError(`Minimum deposit is UGX ${minAmount.toLocaleString()}`);
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
        const stripeResult = await createPaymentIntent(totalAmount, depositAmount);
        setClientSecret(stripeResult.clientSecret || null);
        setTxRef(stripeResult.transactionReference || "");
        setStep(2);
      } else {
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
    setIsLoading(true);
    setError(null);
    try {
      const result = await processMobileMoneyDeposit(parseFloat(amount));

      if (result.success) {
        router.push(
          `/dashboard/user/wallet/topup/success?ref=${result.refference}&amount=${amount}&method=Mobile Money&fee=${fee}`,
        );
      } else {
        setError(result.message || "Mobile Money payment failed");
      }
    } catch (err: unknown) {
      console.error("Momo payment error:", err);
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
              step === 1 ? router.push("/dashboard/user/wallet") : setStep(1)
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
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
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
                          onClick={() => setSelectedMethod(method.id)}
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
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Amount to Top Up
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-gray-400 dark:text-gray-600 font-black text-lg">
                          UGX
                        </span>
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-20 pr-6 py-5 text-3xl font-black focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
                      >
                        <AlertCircle size={18} />
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <button
                    onClick={handleContinue}
                    disabled={isLoading || !amount}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 size={24} className="animate-spin" />
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
                      options={{
                        clientSecret,
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
                      }}
                    >
                      <StripePaymentForm
                        amount={parseFloat(amount)}
                        transactionReference={txRef}
                        onCancel={() => setStep(1)}
                        onSuccess={(reference) => {
                          router.push(
                            `/dashboard/user/wallet/topup/success?ref=${reference}`,
                          );
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Confirm Mobile Money
                    </h2>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6 mb-8 flex gap-4">
                      <Smartphone
                        className="text-amber-600 shrink-0"
                        size={24}
                      />
                      <p className="text-amber-900 dark:text-amber-400 text-sm leading-relaxed font-medium">
                        Ensure your phone is unlocked. You will receive a prompt
                        to enter your MM PIN to authorize the transaction of{" "}
                        <strong>
                          UGX {(parseFloat(amount) + fee).toLocaleString()}
                        </strong>
                        .
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleMomoPayment}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          "Confirm & Authorize"
                        )}
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                        className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
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
                      ? "Mobile Money"
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
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    System Fee <Info size={14} className="text-gray-400" />
                  </span>
                  <span className="text-indigo-600 font-bold">
                    + UGX {fee.toLocaleString()}
                  </span>
                </div>

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
