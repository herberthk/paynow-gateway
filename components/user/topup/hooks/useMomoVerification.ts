"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { normalizeUgMsisdn, detectProvider } from "@/lib/yo/phone";
import { verifyMsisdnAction } from "@/lib/actions/msisdn";
import type { PaymentMethod, VerifiedAccount, PhonePreview } from "../types";

interface UseMomoVerificationOptions {
  initialPhone?: string;
  selectedMethod: PaymentMethod;
  onClearError?: () => void;
}

export function useMomoVerification({
  initialPhone = "",
  selectedMethod,
  onClearError,
}: UseMomoVerificationOptions) {
  const [phone, setPhone] = useState<string>(() => {
    if (!initialPhone) return "";
    const n = normalizeUgMsisdn(initialPhone);
    return n.ok ? n.msisdn : initialPhone;
  });

  const [verifiedAccount, setVerifiedAccount] = useState<VerifiedAccount | null>(null);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState<string | null>(null);

  const phonePreview = useMemo<PhonePreview>(() => {
    const normalized = normalizeUgMsisdn(phone);
    if (!normalized.ok) {
      return {
        msisdn: null,
        provider: null,
        error: normalized.error,
      };
    }
    return {
      msisdn: normalized.msisdn,
      provider: detectProvider(normalized.msisdn),
      error: null,
    };
  }, [phone]);

  const handlePhoneInputChange = useCallback((rawVal: string) => {
    let cleaned = rawVal.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);

    if (cleaned.startsWith("0") && cleaned.length > 1) {
      cleaned = `256${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("7") && cleaned.length <= 10) {
      cleaned = `256${cleaned}`;
    }

    if (cleaned.length > 12) {
      cleaned = cleaned.slice(0, 12);
    }

    setPhone(cleaned);
    setVerifiedAccount((prev) => (prev && prev.msisdn !== cleaned ? null : prev));
    setPhoneVerificationError(null);
    onClearError?.();
  }, [onClearError]);

  const triggerVerification = useCallback(async (targetPhone: string) => {
    const normalized = normalizeUgMsisdn(targetPhone);
    if (!normalized.ok) {
      setPhoneVerificationError(normalized.error);
      setVerifiedAccount(null);
      return;
    }

    const msisdn = normalized.msisdn;
    if (!/^256\d{9}$/.test(msisdn)) {
      setPhoneVerificationError("Format must be '256XXXXXXXXX' (12 digits, e.g. 256779256643)");
      setVerifiedAccount(null);
      return;
    }

    const provider = detectProvider(msisdn);
    if (!provider) {
      setPhoneVerificationError("Only MTN and Airtel Uganda numbers are supported");
      setVerifiedAccount(null);
      return;
    }

    setIsVerifyingPhone(true);
    setPhoneVerificationError(null);

    try {
      const res = await verifyMsisdnAction(msisdn);
      if (res.success) {
        // Normalize the MSISDN returned by the API so the exact-match
        // readiness check (verifiedAccount.msisdn === phone) is always
        // consistent regardless of the format the server echoes back.
        const normalizedResult = normalizeUgMsisdn(res.msisdn);
        const canonicalMsisdn = normalizedResult.ok ? normalizedResult.msisdn : msisdn;
        setVerifiedAccount({
          name: res.name,
          msisdn: canonicalMsisdn,
          provider: res.provider,
        });
        setPhoneVerificationError(null);
      } else {
        setVerifiedAccount(null);
        setPhoneVerificationError(
          res.message || "Failed to verify phone number. Please ensure the number is active on Mobile Money."
        );
      }
    } catch {
      setVerifiedAccount(null);
      setPhoneVerificationError("Phone number verification failed. Please try again.");
    } finally {
      setIsVerifyingPhone(false);
    }
  }, []);

  // Debounced auto-verification
  useEffect(() => {
    if (selectedMethod !== "momo") return;
    if (!phone || phone.length !== 12) return;
    if (!/^256\d{9}$/.test(phone)) return;
    if (verifiedAccount?.msisdn === phone) return;

    const timer = setTimeout(() => {
      triggerVerification(phone);
    }, 450);

    return () => clearTimeout(timer);
  }, [phone, selectedMethod, verifiedAccount?.msisdn, triggerVerification]);

  const isMomoReady = Boolean(
    selectedMethod === "momo" &&
    verifiedAccount &&
    verifiedAccount.msisdn === phone &&
    !isVerifyingPhone
  );

  return {
    phone,
    phonePreview,
    verifiedAccount,
    isVerifyingPhone,
    phoneVerificationError,
    isMomoReady,
    handlePhoneInputChange,
    triggerVerification,
    setVerifiedAccount,
    setPhoneVerificationError,
  };
}
