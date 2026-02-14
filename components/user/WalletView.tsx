"use client";
import {
  Wallet,
  Send,
  ArrowDownCircle,
  PlusCircle,
  CreditCard,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useAppStore, useTransactionStore } from "@/store";
import { linkedMethods } from "@/services/mockData";
import { useEffect, useState } from "react";
import { findUserByEmailOrPhone } from "@/lib/actions/users";
import { processP2PTransfer } from "@/lib/actions/wallet";
import { ErrorModal, ConfirmationModal, SuccessModal } from "../modals";

type UserProps = {
  user: User;
  wallet: WalletResult;
};

const WalletView = ({ user, wallet }: UserProps) => {
  const openPaymentModal = useAppStore((state) => state.openPaymentModal);
  const transactionAmout = useTransactionStore((state) => state.amount);
  const setTransactionAmout = useTransactionStore((state) => state.setAmount);
  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientUser | null>(
    null,
  );

  // Loading and error states
  const [isSearching, setIsSearching] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState<PreviewTransaction>({
    amount: 0,
    currency: "UGX",
    txn_ref: "",
    fee: 0,
  });

  const setTotalBalance = useTransactionStore((state) => state.setTotalBalance);
  // setTotalBalance(stats[0].value);

  // Handle Send button click - Look up recipient
  const handleSendClick = async () => {
    // Reset states
    setError("");
    // setSuccess("");

    // Validate inputs
    if (!recipient.trim()) {
      setError("Please enter recipient email or phone number");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!amount || transferAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const TRANSACTION_FEE = 200;
    const totalRequired = transferAmount + TRANSACTION_FEE;

    if (totalRequired > wallet.balance) {
      setError(
        `Insufficient balance. Available: UGX ${wallet.balance.toLocaleString()} (Required: UGX ${totalRequired.toLocaleString()})`,
      );
      return;
    }

    setIsSearching(true);

    try {
      // Look up recipient
      const result = await findUserByEmailOrPhone(recipient.trim());

      if (!result.success || !result.user) {
        setError(result.message || "User not found");
        setIsSearching(false);
        return;
      }

      // Check if trying to send to self
      if (result.user.id === user.id) {
        setError("You cannot transfer money to yourself");
        setIsSearching(false);
        return;
      }

      // Show confirmation modal
      setRecipientData(result?.user);
      setShowConfirmModal(true);
    } catch (err) {
      setError("An error occurred while searching for the user");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle transfer confirmation
  const handleConfirmTransfer = async () => {
    if (!recipientData) return;

    setIsTransferring(true);
    setError("");

    try {
      const transferAmount = parseFloat(amount);
      setTransactionAmout(transferAmount);
      // Process wallet transfer
      const transferResult = await processP2PTransfer(
        user.id,
        recipientData.id,
        transferAmount,
      );

      if (!transferResult.success) {
        setError(transferResult.message || "Transfer failed");
        setIsTransferring(false);
        return;
      }

      setTransaction({
        amount: transferResult.amount!,
        currency: transferResult.currency!,
        txn_ref: transferResult.refference!,
        fee: transferResult.fee!,
      });

      // Success! Show beautiful success modal
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setRecipient("");
      setAmount("");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle cancel
  const handleCancelTransfer = () => {
    setShowConfirmModal(false);
    setRecipientData(null);
    setError("");
  };

  useEffect(() => {
    setTotalBalance(`UGX ${wallet?.balance.toLocaleString()}`);
  }, [wallet?.balance]);

  return (
    <div className="space-y-6">
      {/* Error Modal */}
      {error && <ErrorModal error={error} onClose={() => setError("")} />}

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-1">
              Total Balance (UGX)
            </p>
            <h2 className="text-4xl font-bold mb-4">
              UGX {wallet.balance.toLocaleString()}
            </h2>

            <p className="text-indigo-100 font-medium mb-1 mt-6">USD Balance</p>
            <h3 className="text-2xl font-bold">
              $ {(Number(wallet.balance) / 3650).toLocaleString()}
            </h3>
          </div>
          <div className="mt-6 flex gap-3 relative z-10">
            <button
              onClick={() => openPaymentModal("deposit")}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> Top Up
            </button>
            <button
              onClick={() => openPaymentModal("withdraw")}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownCircle size={16} /> Withdraw
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
            Linked Methods
          </h3>
          <div className="space-y-3">
            {linkedMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      method.type === "MOBILE_MONEY"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {method.type === "MOBILE_MONEY" ? (
                      <Smartphone size={20} />
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {method.detail}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                  Remove
                </button>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              <PlusCircle size={16} /> Link New Card / Mobile Money
            </button>
          </div>
        </div>
      </div>

      {/* Quick Transfer */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Send size={20} className="text-indigo-600 dark:text-indigo-400" />
          Quick Transfer (P2P)
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient (Email or Phone)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isSearching || isTransferring}
              className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., user@email.com or +256 700 000000"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSearching || isTransferring}
                className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg pl-12 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSendClick}
              disabled={isSearching || isTransferring}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Searching...
                </>
              ) : (
                <>
                  Send <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span> Instant
          transfer to any PayNow user.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && recipientData && (
        <ConfirmationModal
          amount={amount}
          recipientData={recipientData}
          handleCancelTransfer={handleCancelTransfer}
          handleConfirmTransfer={handleConfirmTransfer}
          isTransferring={isTransferring}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && recipientData && (
        <SuccessModal
          recipientData={recipientData}
          setShowSuccessModal={setShowSuccessModal}
          setRecipientData={setRecipientData}
          transaction={transaction}
        />
      )}
    </div>
  );
};

export default WalletView;
