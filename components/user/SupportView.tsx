"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/global/StripePaymentForm";
import type { Appearance } from "@stripe/stripe-js";
import { searchUsers } from "@/lib/actions/users";
import { getTransactionFee } from "@/lib/actions/fee";
import { createPaymentIntent } from "@/lib/actions/stripe";
import { processWalletSupport, initiateYoSupport } from "@/lib/actions/support";
import { useMomoVerification } from "./topup/hooks/useMomoVerification";
import { useMomoPolling } from "./topup/hooks/useMomoPolling";
import {
  SupportHeader,
  SupportSummary,
  StepRecipientAmount,
  StepSupportMomoPayment,
  useRecipientVerification,
  type SupportPaymentMethod,
  type RecipientUser,
} from "./support";
import { MAX_TOPUP } from "@/lib/yo/constants";

interface SupportViewProps {
  user: User | null;
  wallet: WalletResult;
}

const SupportView = ({ user, wallet }: SupportViewProps) => {
  const router = useRouter();

  // Search & Recipient state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RecipientUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientUser | null>(null);

  // Form step & method state
  const [selectedMethod, setSelectedMethod] = useState<SupportPaymentMethod>("wallet");
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [stripePromise] = useState(() => getStripe());
  const momoRequestKeyRef = useRef("");

  const clearError = useCallback(() => setError(null), []);

  // Recipient verification hook
  const {
    recipientPhone,
    recipientPhonePreview,
    verifiedRecipient,
    isVerifyingRecipient,
    recipientVerificationError,
    handleRecipientPhoneChange,
    triggerRecipientVerification,
  } = useRecipientVerification({
    selectedRecipient,
    onClearError: clearError,
  });

  // Payer mobile money verification hook (for when Momo is chosen)
  const {
    phone: payerPhone,
    phonePreview: payerPhonePreview,
    verifiedAccount: verifiedPayer,
    isVerifyingPhone: isVerifyingPayer,
    phoneVerificationError: payerVerificationError,
    handlePhoneInputChange: handlePayerPhoneChange,
    triggerVerification: triggerPayerVerification,
  } = useMomoVerification({
    initialPhone: user?.tel ?? "",
    selectedMethod: selectedMethod === "momo" ? "momo" : "card",
    onClearError: clearError,
  });

  // Mobile Money polling hook (configured to push to support success)
  const {
    momoPhase,
    setMomoPhase,
    externalRef,
    setExternalRef,
    pollStartedAt,
    setPollStartedAt,
    pollWindowCount,
    setPollWindowCount,
    startPolling,
    enterMomoConfirm,
    handleKeepWaiting,
    resetMomoState,
  } = useMomoPolling({
    onClearError: clearError,
    successRedirectPath: "/dashboard/user/wallet/support/success",
  });

  // Debounced search for users
  useEffect(() => {
    let isActive = true;
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2 && user?.id) {
        setIsSearching(true);
        try {
          const res = await searchUsers(searchQuery, user.id);
          if (!isActive) return;
          if (res.success) {
            setSearchResults(res.users);
          } else {
            setSearchResults([]);
          }
        } catch {
          if (isActive) setSearchResults([]);
        } finally {
          if (isActive) setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, user?.id]);

  const handleSelectMethod = useCallback(
    (method: SupportPaymentMethod) => {
      setSelectedMethod(method);
      setClientSecret(null);
      setTxRef("");
      momoRequestKeyRef.current = "";
      resetMomoState();
      clearError();
    },
    [resetMomoState, clearError]
  );

  const isMomoTransactionLocked =
    selectedMethod === "momo" &&
    (momoPhase === "sending" ||
      (Boolean(externalRef) &&
        (momoPhase === "pending" || momoPhase === "timeout")));

  const goBackToStep1 = useCallback(() => {
    if (isMomoTransactionLocked) {
      setError(
        "This Mobile Money payment is still pending. Wait for a final status before changing details or authorizing another payment."
      );
      return;
    }
    setError(null);
    setFee(0);
    momoRequestKeyRef.current = "";
    resetMomoState();
    setStep(1);
  }, [isMomoTransactionLocked, resetMomoState]);

  const handleSelectRecipient = useCallback((recipient: RecipientUser) => {
    setSelectedRecipient(recipient);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  }, []);

  const handleClearRecipient = useCallback(() => {
    setSelectedRecipient(null);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  }, []);

  // Validation gates
  const parsedAmount = parseFloat(amount || "0");
  const minAmount =
    selectedMethod === "card" ? 10000 : selectedMethod === "wallet" ? 1000 : 500;

  const isAmountValid = Boolean(
    amount &&
    /^\d+$/.test(amount.trim()) &&
    parsedAmount >= minAmount &&
    parsedAmount <= MAX_TOPUP
  );

  const isMomoReady =
    selectedMethod === "momo" &&
    Boolean(verifiedPayer && verifiedPayer.msisdn === payerPhone) &&
    !isVerifyingPayer;

  const isWalletReady = selectedMethod === "wallet";
  const isCardReady = selectedMethod === "card";

  const canContinue = Boolean(
    !isLoading &&
    !isSearching &&
    !isVerifyingRecipient &&
    !isVerifyingPayer &&
    selectedRecipient &&
    verifiedRecipient &&
    verifiedRecipient.msisdn === recipientPhone &&
    (isWalletReady || isCardReady || isMomoReady) &&
    isAmountValid
  );

  const handleContinue = async () => {
    if (!selectedRecipient) {
      setError("Please select a recipient to support");
      return;
    }
    if (
      !verifiedRecipient ||
      verifiedRecipient.msisdn !== recipientPhone
    ) {
      setError("The recipient’s Mobile Money number must be verified before continuing");
      return;
    }

    const rawAmount = amount.trim();
    if (!/^\d+$/.test(rawAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }

    const supportAmount = parseInt(rawAmount, 10);
    if (isNaN(supportAmount) || supportAmount < minAmount) {
      setError(`Minimum support amount is UGX ${minAmount.toLocaleString()}`);
      return;
    }
    if (supportAmount > MAX_TOPUP) {
      setError(`Maximum support amount is UGX ${MAX_TOPUP.toLocaleString()}`);
      return;
    }

    // Momo validation gate
    if (selectedMethod === "momo") {
      if (!payerPhone || !/^256\d{9}$/.test(payerPhone)) {
        setError("Please enter a valid 12-digit Ugandan payer phone number (256XXXXXXXXX)");
        return;
      }
      if (isVerifyingPayer) {
        setError("Please wait while your payer phone number is being verified");
        return;
      }
      if (!verifiedPayer || verifiedPayer.msisdn !== payerPhone) {
        setError("Your mobile money number must be verified before continuing");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const feeResult = await getTransactionFee({
        amount: supportAmount,
        type: "SUPPORT",
      });

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
            `Insufficient balance. Available: UGX ${wallet.balance.toLocaleString()} (Required: UGX ${totalRequired.toLocaleString()})`
          );
          return;
        }
        setStep(2);
      } else if (selectedMethod === "card") {
        const stripeResult = await createPaymentIntent({
          amount: totalRequired,
          baseAmount: supportAmount,
          type: "support",
          toUserId: selectedRecipient.id,
          fromUserId: user?.id,
        });

        if (!stripeResult.clientSecret) {
          setError("Failed to initialize card payment");
          return;
        }

        setClientSecret(stripeResult.clientSecret || null);
        setTxRef(stripeResult.transactionReference || "");
        setStep(2);
      } else if (selectedMethod === "momo") {
        momoRequestKeyRef.current = crypto.randomUUID();
        enterMomoConfirm();
        setStep(2);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Authorize Mobile Money Support via Yo! Payments
  const handleMomoPayment = async () => {
    if (isLoading || isMomoTransactionLocked) {
      setError(
        "A Mobile Money payment is already in progress. Wait for its final status before trying again."
      );
      return;
    }
    if (
      !selectedRecipient ||
      !verifiedRecipient ||
      verifiedRecipient.msisdn !== recipientPhone ||
      !verifiedPayer
    ) {
      setError("Missing verified recipient or payer details");
      return;
    }

    const rawMomoAmount = amount.trim();
    if (!/^\d+$/.test(rawMomoAmount)) {
      setError("Enter a whole amount in UGX (no decimals)");
      return;
    }
    const momoAmount = parseInt(rawMomoAmount, 10);
    const requestKey = momoRequestKeyRef.current || crypto.randomUUID();
    momoRequestKeyRef.current = requestKey;

    setIsLoading(true);
    setError(null);
    setMomoPhase("sending");

    try {
      const result = await initiateYoSupport({
        amount: momoAmount,
        toUserId: selectedRecipient.id,
        payerMsisdn: verifiedPayer.msisdn,
        recipientMsisdn: verifiedRecipient.msisdn,
        requestKey,
        narrative: `Support for ${selectedRecipient.name || "User"}`,
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
        setError((!result.success && result.message) || "Support payment failed");
      }
    } catch (err: unknown) {
      console.error("Momo support error:", err);
      setMomoPhase("confirm");
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryMomo = useCallback(() => {
    momoRequestKeyRef.current = crypto.randomUUID();
    enterMomoConfirm();
  }, [enterMomoConfirm]);

  // Authorize Wallet Balance P2P Support
  const handleWalletPayment = async () => {
    if (!selectedRecipient || !user) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await processWalletSupport({
        senderId: user.id,
        recipientId: selectedRecipient.id,
        amount: parseInt(amount.trim(), 10),
      });

      if (result.success) {
        router.push(
          `/dashboard/user/wallet/support/success?ref=${encodeURIComponent(result.refference || "")}`
        );
      } else {
        setError(result.message || "Wallet support transfer failed");
      }
    } catch (err: unknown) {
      console.error("Wallet support error:", err);
      setError(
        err instanceof Error ? err.message : "Transfer failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-transparent">
      {/* Header & Step Tracker */}
      <SupportHeader
        step={step}
        onBack={step === 1 ? () => router.push("/dashboard/user/wallet") : goBackToStep1}
        onViewHistory={() => router.push("/dashboard/user/support/history")}
        backDisabled={step === 2 && isMomoTransactionLocked}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Interactive Steps */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <StepRecipientAmount
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                selectedRecipient={selectedRecipient}
                onSelectRecipient={handleSelectRecipient}
                onClearRecipient={handleClearRecipient}
                recipientPhone={recipientPhone}
                onRecipientPhoneChange={handleRecipientPhoneChange}
                recipientPhonePreview={recipientPhonePreview}
                isVerifyingRecipient={isVerifyingRecipient}
                verifiedRecipient={verifiedRecipient}
                recipientVerificationError={recipientVerificationError}
                onRetryRecipientVerification={triggerRecipientVerification}
                selectedMethod={selectedMethod}
                onSelectMethod={handleSelectMethod}
                amount={amount}
                onAmountChange={(val) => {
                  setAmount(val);
                  if (error) setError(null);
                }}
                walletBalance={wallet.balance}
                payerPhone={payerPhone}
                onPayerPhoneChange={handlePayerPhoneChange}
                payerPhonePreview={payerPhonePreview}
                isVerifyingPayer={isVerifyingPayer}
                verifiedPayer={verifiedPayer}
                payerVerificationError={payerVerificationError}
                onRetryPayerVerification={triggerPayerVerification}
                error={error}
                isLoading={isLoading}
                canContinue={canContinue}
                onContinue={handleContinue}
              />
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
                        onCancel={goBackToStep1}
                        onSuccess={(reference) => {
                          router.push(
                            `/dashboard/user/wallet/support/success?ref=${encodeURIComponent(reference)}`
                          );
                        }}
                      />
                    </Elements>
                  </div>
                ) : selectedMethod === "wallet" ? (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Confirm Wallet Support
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">
                          Direct transfer from your available wallet balance
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6 mb-8 flex gap-4">
                      <Wallet className="text-amber-600 shrink-0 mt-0.5" size={24} />
                      <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed font-medium">
                        You are about to debit{" "}
                        <strong>UGX {(parseFloat(amount) + fee).toLocaleString()}</strong>{" "}
                        from your wallet balance to support{" "}
                        <strong>{selectedRecipient?.name}</strong>. This transfer is immediate and non-reversible.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleWalletPayment}
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          "Confirm & Transfer Funds"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={goBackToStep1}
                        disabled={isLoading}
                        className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 text-sm cursor-pointer"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <StepSupportMomoPayment
                    momoPhase={momoPhase}
                    amount={amount}
                    fee={fee}
                    recipient={selectedRecipient as RecipientUser}
                    verifiedRecipient={verifiedRecipient}
                    verifiedPayer={verifiedPayer}
                    payerPhonePreview={payerPhonePreview}
                    payerPhone={payerPhone}
                    externalRef={externalRef}
                    pollStartedAt={pollStartedAt}
                    pollWindowCount={pollWindowCount}
                    isLoading={isLoading}
                    error={error}
                    onAuthorize={handleMomoPayment}
                    onBackToStep1={goBackToStep1}
                    onRetryConfirm={handleRetryMomo}
                    onKeepWaiting={handleKeepWaiting}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Transaction Summary */}
        <SupportSummary
          step={step}
          selectedRecipient={selectedRecipient}
          verifiedRecipient={verifiedRecipient}
          selectedMethod={selectedMethod}
          amount={amount}
          fee={fee}
          verifiedPayer={verifiedPayer}
          payerPhonePreview={payerPhonePreview}
        />
      </div>
    </div>
  );
};

export default SupportView;
