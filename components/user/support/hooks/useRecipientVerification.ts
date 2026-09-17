"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { normalizeUgMsisdn, detectProvider } from "@/lib/yo/phone";
import { verifyMsisdnAction } from "@/lib/actions/msisdn";
import type { VerifiedAccount, PhonePreview, RecipientUser } from "../types";

interface UseRecipientVerificationOptions {
  selectedRecipient: RecipientUser | null;
  onClearError?: () => void;
}

export function useRecipientVerification({
  selectedRecipient,
  onClearError,
}: UseRecipientVerificationOptions) {
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [verifiedRecipient, setVerifiedRecipient] = useState<VerifiedAccount | null>(null);
  const [isVerifyingRecipient, setIsVerifyingRecipient] = useState(false);
  const [recipientVerificationError, setRecipientVerificationError] = useState<string | null>(null);
  const recipientPhoneRef = useRef("");
  const verificationRequestRef = useRef(0);

  // Sync with selected recipient's phone if available
  useEffect(() => {
    if (selectedRecipient?.tel) {
      const normalized = normalizeUgMsisdn(selectedRecipient.tel);
      const phoneToSet = normalized.ok ? normalized.msisdn : selectedRecipient.tel;
      recipientPhoneRef.current = phoneToSet;
      setRecipientPhone(phoneToSet);
      setVerifiedRecipient(null);
      setRecipientVerificationError(null);
    } else {
      recipientPhoneRef.current = "";
      setRecipientPhone("");
      setVerifiedRecipient(null);
      setRecipientVerificationError(null);
    }
    verificationRequestRef.current += 1;
    setIsVerifyingRecipient(false);
  }, [selectedRecipient]);

  const recipientPhonePreview = useMemo<PhonePreview>(() => {
    const normalized = normalizeUgMsisdn(recipientPhone);
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
  }, [recipientPhone]);

  const handleRecipientPhoneChange = useCallback((rawVal: string) => {
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

    recipientPhoneRef.current = cleaned;
    verificationRequestRef.current += 1;
    setRecipientPhone(cleaned);
    setIsVerifyingRecipient(false);
    setVerifiedRecipient((prev) => (prev && prev.msisdn !== cleaned ? null : prev));
    setRecipientVerificationError(null);
    onClearError?.();
  }, [onClearError]);

  const triggerRecipientVerification = useCallback(async (targetPhone: string) => {
    const requestGeneration = verificationRequestRef.current + 1;
    verificationRequestRef.current = requestGeneration;
    const normalized = normalizeUgMsisdn(targetPhone);
    if (!normalized.ok) {
      setRecipientVerificationError(normalized.error);
      setVerifiedRecipient(null);
      return;
    }

    const msisdn = normalized.msisdn;
    const isCurrentRequest = () => {
      const currentPhone = normalizeUgMsisdn(recipientPhoneRef.current);
      return (
        verificationRequestRef.current === requestGeneration &&
        currentPhone.ok &&
        currentPhone.msisdn === msisdn
      );
    };

    if (!isCurrentRequest()) return;

    if (!/^256\d{9}$/.test(msisdn)) {
      setRecipientVerificationError("Format must be '256XXXXXXXXX' (12 digits, e.g. 256779123456)");
      setVerifiedRecipient(null);
      return;
    }

    const provider = detectProvider(msisdn);
    if (!provider) {
      setRecipientVerificationError("Only MTN and Airtel Uganda numbers are supported");
      setVerifiedRecipient(null);
      return;
    }

    setIsVerifyingRecipient(true);
    setRecipientVerificationError(null);

    try {
      const res = await verifyMsisdnAction(msisdn);
      if (!isCurrentRequest()) return;
      if (res.success) {
        const normalizedResult = normalizeUgMsisdn(res.msisdn);
        const canonicalMsisdn = normalizedResult.ok ? normalizedResult.msisdn : msisdn;
        setVerifiedRecipient({
          name: res.name,
          msisdn: canonicalMsisdn,
          provider: res.provider,
        });
        setRecipientVerificationError(null);
      } else {
        setVerifiedRecipient(null);
        setRecipientVerificationError(
          res.message || "Recipient number is not registered on Mobile Money."
        );
      }
    } catch {
      if (!isCurrentRequest()) return;
      setVerifiedRecipient(null);
      setRecipientVerificationError("Failed to verify recipient phone number. Please try again.");
    } finally {
      if (isCurrentRequest()) setIsVerifyingRecipient(false);
    }
  }, []);

  // Debounced auto-verification for recipient phone
  useEffect(() => {
    if (!recipientPhone || recipientPhone.length !== 12) return;
    if (!/^256\d{9}$/.test(recipientPhone)) return;
    if (verifiedRecipient?.msisdn === recipientPhone) return;

    const timer = setTimeout(() => {
      triggerRecipientVerification(recipientPhone);
    }, 450);

    return () => clearTimeout(timer);
  }, [recipientPhone, verifiedRecipient?.msisdn, triggerRecipientVerification]);

  return {
    recipientPhone,
    recipientPhonePreview,
    verifiedRecipient,
    isVerifyingRecipient,
    recipientVerificationError,
    handleRecipientPhoneChange,
    triggerRecipientVerification,
    setVerifiedRecipient,
    setRecipientVerificationError,
  };
}
