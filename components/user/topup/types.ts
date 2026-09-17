import type { MobileMoneyProviderName } from "@/lib/yo/phone";

export type PaymentMethod = "momo" | "card";

export type MomoPhase = "confirm" | "sending" | "pending" | "failed" | "timeout";

export interface VerifiedAccount {
  name: string;
  msisdn: string;
  provider: MobileMoneyProviderName;
}

export interface PhonePreview {
  msisdn: string | null;
  provider: MobileMoneyProviderName | null;
  error: string | null;
}

export interface TopupHeaderProps {
  step: number;
  onBack: () => void;
}

export interface TopupSummaryProps {
  step: number;
  selectedMethod: PaymentMethod;
  amount: string;
  fee: number;
  phonePreview: PhonePreview;
  verifiedAccount: VerifiedAccount | null;
}

export interface StepAmountProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  phone: string;
  onPhoneChange: (raw: string) => void;
  phonePreview: PhonePreview;
  isVerifyingPhone: boolean;
  verifiedAccount: VerifiedAccount | null;
  phoneVerificationError: string | null;
  onRetryVerification: (phone: string) => void;
  error: string | null;
  isLoading: boolean;
  canContinue: boolean;
  onContinue: () => void;
}

export interface StepMomoPaymentProps {
  momoPhase: MomoPhase;
  amount: string;
  fee: number;
  verifiedAccount: VerifiedAccount | null;
  phonePreview: PhonePreview;
  phone: string;
  externalRef: string;
  pollStartedAt: number;
  pollWindowCount: number;
  isLoading: boolean;
  error: string | null;
  onAuthorize: () => void;
  onBackToStep1: () => void;
  onCancelPending: () => void;
  onRetryConfirm: () => void;
  onKeepWaiting?: () => void;
}

export interface StepCardPaymentProps {
  amount: string;
  txRef: string;
  clientSecret: string | null;
  onCancel: () => void;
  onSuccess: (txRef: string) => void;
}
