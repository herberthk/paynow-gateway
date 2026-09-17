import type { MomoPhase, VerifiedAccount, PhonePreview } from "../topup/types";

export type { MomoPhase, VerifiedAccount, PhonePreview };

export type SupportPaymentMethod = "wallet" | "momo" | "card";

export type RecipientUser = {
  id: number;
  name: string | null;
  email: string | null;
  tel: string | null;
};

export interface StepRecipientAmountProps {
  // Recipient state
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: RecipientUser[];
  isSearching: boolean;
  selectedRecipient: RecipientUser | null;
  onSelectRecipient: (user: RecipientUser) => void;
  onClearRecipient: () => void;

  // Recipient phone & verification
  recipientPhone: string;
  onRecipientPhoneChange: (phone: string) => void;
  recipientPhonePreview: PhonePreview;
  isVerifyingRecipient: boolean;
  verifiedRecipient: VerifiedAccount | null;
  recipientVerificationError: string | null;
  onRetryRecipientVerification: (phone: string) => void;

  // Payment method & Amount
  selectedMethod: SupportPaymentMethod;
  onSelectMethod: (method: SupportPaymentMethod) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  walletBalance: number;

  // Payer Phone & Verification (for Mobile Money)
  payerPhone: string;
  onPayerPhoneChange: (phone: string) => void;
  payerPhonePreview: PhonePreview;
  isVerifyingPayer: boolean;
  verifiedPayer: VerifiedAccount | null;
  payerVerificationError: string | null;
  onRetryPayerVerification: (phone: string) => void;

  // General state
  error: string | null;
  isLoading: boolean;
  canContinue: boolean;
  onContinue: () => void;
}

export interface StepSupportMomoPaymentProps {
  momoPhase: MomoPhase;
  amount: string;
  fee: number;
  recipient: RecipientUser;
  verifiedRecipient: VerifiedAccount | null;
  verifiedPayer: VerifiedAccount | null;
  payerPhonePreview: PhonePreview;
  payerPhone: string;
  externalRef: string;
  pollStartedAt: number;
  pollWindowCount: number;
  isLoading: boolean;
  error: string | null;
  onAuthorize: () => void;
  onBackToStep1: () => void;
  onCancelPending: () => void;
  onRetryConfirm: () => void;
  onKeepWaiting: () => void;
}

export interface SupportSummaryProps {
  step: number;
  selectedRecipient: RecipientUser | null;
  verifiedRecipient: VerifiedAccount | null;
  selectedMethod: SupportPaymentMethod;
  amount: string;
  fee: number;
  verifiedPayer: VerifiedAccount | null;
  payerPhonePreview: PhonePreview;
}

export interface SupportHeaderProps {
  step: number;
  onBack: () => void;
  onViewHistory: () => void;
}
