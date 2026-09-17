"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getTransactionFee } from "@/lib/actions/fee";
import { createPaymentIntent } from "@/lib/actions/stripe";
import { initiateYoDeposit } from "@/lib/actions/yo";
import { MIN_TOPUP, MAX_TOPUP } from "@/lib/yo/constants";
import {
  TopupHeader,
  TopupSummary,
  StepAmount,
  StepMomoPayment,
  StepCardPayment,
  useMomoVerification,
  useMomoPolling,
  type PaymentMethod,
} from "./topup";

const TopupForm = ({ initialPhone = "" }: { initialPhone?: string }) => {
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("momo");
  const [step, setStep] = useState<number>(1);
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");

  const clearError = useCallback(() => setError(null), []);

  const {
    phone,
    phonePreview,
    verifiedAccount,
    isVerifyingPhone,
    phoneVerificationError,
    isMomoReady,
    handlePhoneInputChange,
    triggerVerification,
  } = useMomoVerification({
    initialPhone,
    selectedMethod,
    onClearError: clearError,
  });

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
    handleCancelPending,
    resetMomoState,
  } = useMomoPolling({ onClearError: clearError });

  const handleSelectMethod = useCallback(
    (method: PaymentMethod) => {
      setSelectedMethod(method);
      setClientSecret(null);
      setTxRef("");
      resetMomoState();
    },
    [resetMomoState]
  );

  const goBackToStep1 = useCallback(() => {
    setError(null);
    setFee(0);
    setStep(1);
  }, []);

  const isCardReady = selectedMethod === "card";
  const canContinue =
    !isLoading &&
    !isVerifyingPhone &&
    (isMomoReady || isCardReady) &&
    Boolean(amount && Number(amount) >= MIN_TOPUP && Number(amount) <= MAX_TOPUP);

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

    // Validation Gate for Mobile Money
    if (selectedMethod === "momo") {
      if (!phone || !/^256\d{9}$/.test(phone)) {
        setError("Please enter a valid 12-digit Ugandan phone number in format '256XXXXXXXXX'");
        return;
      }
      if (isVerifyingPhone) {
        setError("Please wait while your phone number is being verified");
        return;
      }
      if (!verifiedAccount || verifiedAccount.msisdn !== phone) {
        setError("Your phone number must be verified with Mobile Money before continuing");
        return;
      }
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
    if (!verifiedAccount || verifiedAccount.msisdn !== phone) {
      setError("Please ensure your phone number is verified before proceeding");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMomoPhase("sending");

    try {
      const result = await initiateYoDeposit({
        amount: momoAmount,
        msisdn: verifiedAccount.msisdn,
        narrative: "Wallet top-up",
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
            "Mobile Money payment failed"
        );
      }
    } catch (err: unknown) {
      console.error("Momo payment error:", err);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-transparent">
      {/* Header & Step Indicator */}
      <TopupHeader
        step={step}
        onBack={step === 1 ? () => router.push("/dashboard/user/wallet") : goBackToStep1}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <StepAmount
                selectedMethod={selectedMethod}
                onSelectMethod={handleSelectMethod}
                amount={amount}
                onAmountChange={(val) => {
                  setAmount(val);
                  if (error) setError(null);
                }}
                phone={phone}
                onPhoneChange={handlePhoneInputChange}
                phonePreview={phonePreview}
                isVerifyingPhone={isVerifyingPhone}
                verifiedAccount={verifiedAccount}
                phoneVerificationError={phoneVerificationError}
                onRetryVerification={triggerVerification}
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
                  <StepCardPayment
                    amount={amount}
                    txRef={txRef}
                    clientSecret={clientSecret}
                    onCancel={goBackToStep1}
                    onSuccess={(reference) => {
                      router.push(
                        `/dashboard/user/wallet/topup/success?ref=${encodeURIComponent(reference)}`
                      );
                    }}
                  />
                ) : (
                  <AnimatePresence mode="wait">
                    <StepMomoPayment
                      momoPhase={momoPhase}
                      amount={amount}
                      fee={fee}
                      verifiedAccount={verifiedAccount}
                      phonePreview={phonePreview}
                      phone={phone}
                      externalRef={externalRef}
                      pollStartedAt={pollStartedAt}
                      pollWindowCount={pollWindowCount}
                      isLoading={isLoading}
                      error={error}
                      onAuthorize={handleMomoPayment}
                      onBackToStep1={goBackToStep1}
                      onCancelPending={handleCancelPending}
                      onRetryConfirm={enterMomoConfirm}
                      onKeepWaiting={handleKeepWaiting}
                    />
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Transaction Summary */}
        <TopupSummary
          step={step}
          selectedMethod={selectedMethod}
          amount={amount}
          fee={fee}
          phonePreview={phonePreview}
          verifiedAccount={verifiedAccount}
        />
      </div>
    </div>
  );
};

export default TopupForm;
