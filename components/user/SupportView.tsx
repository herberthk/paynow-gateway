"use client";

import { useState, useEffect } from "react";
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
  Search,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/global/StripePaymentForm";
import type { Appearance } from "@stripe/stripe-js";
import { searchUsers } from "@/lib/actions/users";

interface SupportViewProps {
  user: User | null;
  wallet: WalletResult;
}

type UserSearch = {
  id: number;
  name: string | null;
  email: string | null;
  tel: string | null;
};
const SupportView = ({ user, wallet }: SupportViewProps) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<UserSearch | null>(
    null,
  );

  const [selectedMethod, setSelectedMethod] = useState<string>("wallet");
  const [step, setStep] = useState(1); // 1: Search & Input, 2: Payment
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [stripePromise] = useState(() => getStripe());

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3 && user?.id) {
        setIsSearching(true);
        const res = await searchUsers(searchQuery, user.id);
        if (res.success) {
          setSearchResults(res.users);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user?.id]);

  const handleContinue = async () => {
    if (!selectedRecipient) {
      setError("Please select a user to support");
      return;
    }

    const supportAmount = parseFloat(amount);
    const minAmount = selectedMethod === "card" ? 10000 : 500;

    if (isNaN(supportAmount) || supportAmount < minAmount) {
      setError(
        `Minimum support amount for this method is UGX ${minAmount.toLocaleString()}`,
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feeResponse = await fetch("/api/v1/fees/getTransactionFee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: supportAmount,
          type: "SUPPORT",
        }),
      });

      const feeResult = await feeResponse.json();

      if (!feeResult.success) {
        setError(feeResult.message || "Fee calculation failed");
        return;
      }

      const calculatedFee =
        user?.privilege === "super_admin" ? 0 : feeResult.amount || 0;
      setFee(calculatedFee);

      const totalRequired = supportAmount + calculatedFee;

      if (selectedMethod === "wallet") {
        if (wallet.balance < totalRequired) {
          setError(
            `Insufficient balance. Available: UGX ${wallet.balance.toLocaleString()} (Required: UGX ${totalRequired.toLocaleString()})`,
          );
          setIsLoading(false);
          return;
        }
        setStep(2);
      } else if (selectedMethod === "card") {
        const stripeResponse = await fetch(
          "/api/v1/stripe/createPaymentIntent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              amount: totalRequired,
              baseAmount: supportAmount,
              type: "support",
              toUserId: selectedRecipient.id,
              fromUserId: user?.id,
            }),
          },
        );

        const stripeResult = await stripeResponse.json();

        if (!stripeResult.success) {
          setError(stripeResult.message || "Failed to initialize payment");
          return;
        }

        setClientSecret(stripeResult.clientSecret || null);
        setTxRef(stripeResult.transactionReference || "");
        setStep(2);
      } else if (selectedMethod === "momo") {
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

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedMethod === "wallet") {
        const response = await fetch("/api/v1/wallet/processWalletSupport", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            toUserId: selectedRecipient?.id,
            amount: parseFloat(amount),
          }),
        });
        const result = await response.json();
        if (result.success) {
          router.push(
            `/dashboard/user/wallet/support/success?ref=${result.refference}`,
          );
        } else {
          setError(result.message || "Wallet support failed");
        }
      } else if (selectedMethod === "momo") {
        const response = await fetch(
          "/api/v1/wallet/processMobileMoneySupport",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              toUserId: selectedRecipient?.id,
              amount: parseFloat(amount),
            }),
          },
        );
        const result = await response.json();
        if (result.success) {
          router.push(
            `/dashboard/user/wallet/support/success?ref=${result.refference}`,
          );
        } else {
          setError(result.message || "Mobile Money support failed");
        }
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
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
      {/* Header */}
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
              Support a User
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Send financial support securely
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/user/support/history")}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all active:scale-95"
        >
          <Calendar size={18} className="text-indigo-600" />
          View History
        </button>
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
                    Step 1: Details
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Recipient Search */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Search Recipient (Name, Email, Phone)
                    </label>
                    {!selectedRecipient ? (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Search size={20} />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                        />
                        {isSearching && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2
                              size={18}
                              className="animate-spin text-indigo-500"
                            />
                          </div>
                        )}
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {searchResults.map((res) => (
                              <button
                                key={res.id}
                                onClick={() => {
                                  setSelectedRecipient(res);
                                  setSearchQuery("");
                                  setSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 last:border-0 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                  <UserIcon size={16} />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                                    {res.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {res.email}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {selectedRecipient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedRecipient.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRecipient(null)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Method Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: "wallet", name: "Wallet Balance", icon: Wallet },
                        { id: "momo", name: "Mobile Money", icon: Smartphone },
                        { id: "card", name: "Card", icon: CreditCard },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                            selectedMethod === method.id
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600"
                              : "border-gray-100 dark:border-slate-800 text-gray-400 hover:border-indigo-200 dark:hover:border-slate-700"
                          }`}
                        >
                          <method.icon size={24} className="mb-2" />
                          <span className="font-bold text-xs tracking-tight text-center">
                            {method.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Support Amount
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
                    disabled={isLoading || !amount || !selectedRecipient}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        Continue
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
                            `/dashboard/user/wallet/support/success?ref=${reference}`,
                          );
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Confirm{" "}
                      {selectedMethod === "wallet"
                        ? "Wallet Transfer"
                        : "Mobile Money"}
                    </h2>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6 mb-8 flex gap-4">
                      {selectedMethod === "wallet" ? (
                        <Wallet className="text-amber-600 shrink-0" size={24} />
                      ) : (
                        <Smartphone
                          className="text-amber-600 shrink-0"
                          size={24}
                        />
                      )}
                      <p className="text-amber-900 dark:text-amber-400 text-sm leading-relaxed font-medium">
                        {selectedMethod === "wallet"
                          ? `You are about to transfer UGX ${(parseFloat(amount) + fee).toLocaleString()} from your wallet balance to ${selectedRecipient?.name}.`
                          : `Ensure your phone is unlocked. You will receive a prompt to enter your MM PIN to authorize the transaction of UGX ${(parseFloat(amount) + fee).toLocaleString()}.`}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handlePayment}
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
                  <span className="text-gray-500 font-medium">Recipient</span>
                  <span className="text-gray-900 dark:text-white font-bold truncate max-w-[150px]">
                    {selectedRecipient
                      ? selectedRecipient.name
                      : "Not Selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">
                    Payment Method
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold capitalize">
                    {selectedMethod === "momo"
                      ? "Mobile Money"
                      : selectedMethod === "wallet"
                        ? "Wallet Balance"
                        : "Card Payment"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-500 font-medium">
                    Support Amount
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
                    Funds will be sent to the recipient instantly after
                    successful authorization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
