"use client";
import { useState, type Dispatch, type FC, type SetStateAction } from "react";
import {
  X,
  Smartphone,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useAppStore, useNotificationStore } from "@/store";
import { processMobileMoneyDeposit } from "@/lib/actions/wallet";
import { getTransactionFee } from "@/lib/actions/fee";

type PaymentModalProps = {
  user: User;
  walletBalance: number;
};

type SelectMethodProps = {
  selectedMethod: string;
  setSelectedMethod: Dispatch<SetStateAction<string>>;
  paymentModal: globalThis.PaymentModalProps;
};

const SelectMethod: FC<SelectMethodProps> = ({
  selectedMethod,
  setSelectedMethod,
  paymentModal,
}) => (
  <div className="grid grid-cols-2 gap-3 mb-6">
    {[
      { id: "momo", name: "Mobile Money", icon: Smartphone },
      { id: "card", name: "Card", icon: CreditCard },
      { id: "ussd", name: "USSD", icon: Banknote },
      {
        id: "qr",
        name: "QR Code",
        icon: QrCode,
        hidden: paymentModal.type === "withdraw",
      },
    ]
      .filter((m) => !m.hidden)
      .map((method) => (
        <button
          key={method.id}
          onClick={() => setSelectedMethod(method.id)}
          className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all duration-200 ${
            selectedMethod === method.id
              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
              : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800"
          }`}
        >
          <method.icon size={20} />
          <span className="font-semibold text-xs">{method.name}</span>
        </button>
      ))}
  </div>
);

const PaymentModal = ({ user, walletBalance }: PaymentModalProps) => {
  const notify = useNotificationStore((state) => state.notify);
  const [selectedMethod, setSelectedMethod] = useState<string>("momo");
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);

  const paymentModal = useAppStore((state) => state.paymentModal);
  const closePaymentModal = useAppStore((state) => state.closePaymentModal);

  if (!paymentModal.isOpen) return null;

  const handleContinueToReview = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 500) {
      setError("Please enter a valid amount (minimum UGX 500).");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const feeResult = await getTransactionFee({
        amount: depositAmount,
        type: "DEPOSIT",
      });
      if (feeResult.success) {
        setFee(feeResult.amount || 0);
        setStep(2);
      } else {
        setError(feeResult.message || "Could not calculate fee.");
      }
    } catch {
      setError("Failed to fetch transaction fee.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    closePaymentModal();
    setStep(1);
    setAmount("");
    setFee(0);
    setTxRef("");
    setError(null);
    setIsLoading(false);
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    setIsLoading(true);
    setError(null);

    try {
      const result = await processMobileMoneyDeposit(user.id, depositAmount);
      // console.log("result", result);
      if (result.success) {
        setTxRef(result?.refference || "");
        setStep(3);
        notify(
          "SUCCESS",
          `Deposit of UGX ${depositAmount.toLocaleString()} successful!`,
        );
        setNewWalletBalance(walletBalance + depositAmount);
        console.log("newWalletBalance", newWalletBalance.toLocaleString());
      } else {
        setError(result.message || "Deposit failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    paymentModal.type === "deposit" ? "Top Up Wallet" : "Withdraw Funds";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
              {step === 3 ? "Transaction Success" : title}
            </h3>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Choose your preferred method:
              </p>
              <SelectMethod
                selectedMethod={selectedMethod}
                setSelectedMethod={setSelectedMethod}
                paymentModal={paymentModal}
              />

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Deposit
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-lg group-focus-within:text-indigo-500 transition-colors">
                    UGX
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-2xl pl-16 pr-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none disabled:opacity-50 transition-all"
                    placeholder="0"
                  />
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in shake-in duration-300">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueToReview}
                disabled={isLoading || !amount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          ) : step === 2 ? (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-6 border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-center mb-6">
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-wider mb-1">
                    Total to Pay
                  </p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">
                    UGX {(parseFloat(amount) + fee).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Deposit Amount
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      UGX {parseFloat(amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Transaction Fee{" "}
                      <Info size={14} className="text-indigo-400" />
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      + UGX {fee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-indigo-100/50 dark:border-indigo-900/10">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Payment Method
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white capitalize">
                      {selectedMethod === "momo"
                        ? "Mobile Money"
                        : selectedMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-6">
                <Smartphone
                  className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  After clicking confirm, please have your phone nearby. You
                  will receive a secure prompt to enter your Mobile Money PIN.
                </p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  "Confirm and Pay"
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                <CheckCircle2
                  size={48}
                  className="animate-in slide-in-from-bottom-2"
                />
              </div>

              <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                Deposit Successful!
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[250px] mx-auto">
                Your funds have been credited. A confirmation email has been
                sent.
              </p>

              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-slate-800 text-left space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Reference ID
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                    {txRef}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Amount Deposited
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    UGX {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Fee Charged
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    UGX {fee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    New Balance
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    UGX {newWalletBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl transition-all hover:opacity-90 active:scale-95"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
