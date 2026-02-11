"use client";
import {
  Wallet,
  Send,
  ArrowDownCircle,
  PlusCircle,
  CreditCard,
  Smartphone,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import { useAppStore, useTransactionStore } from "@/store";
import { linkedMethods } from "@/services/mockData";
import { useEffect, useState } from "react";
import { findUserByEmailOrPhone } from "@/lib/actions/users";
import { processP2PTransfer } from "@/lib/actions/wallet";
import { createP2PTransaction } from "@/lib/actions/transactions";
import { createTransferNotifications } from "@/lib/actions/notifications";
import { generateTxRef } from "@/utils/helpers";

type UserProps = {
  user: User;
  wallet: Wallet;
};

type RecipientUser = {
  id: number;
  name: string | null;
  email: string | null;
  tel: string | null;
  walletId: string;
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
  const [completedTxnRef, setCompletedTxnRef] = useState("");

  // Loading and error states
  const [isSearching, setIsSearching] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setTotalBalance = useTransactionStore((state) => state.setTotalBalance);
  // setTotalBalance(stats[0].value);

  // Handle Send button click - Look up recipient
  const handleSendClick = async () => {
    // Reset states
    setError("");
    setSuccess("");

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

      // Generate transaction reference
      const txn_ref = await generateTxRef();

      // Record transaction
      const transactionResult = await createP2PTransaction({
        senderId: user.id,
        recipientId: recipientData.id,
        recipientName: recipientData.name || "Unknown",
        amount: transferAmount,
        currency: "UGX",
        txn_ref,
      });

      if (!transactionResult.success) {
        console.error(
          "Failed to record transaction:",
          transactionResult.message,
        );
      }

      // Create notifications for both sender and recipient
      await createTransferNotifications({
        senderId: user.id,
        recipientId: recipientData.id,
        recipientName: recipientData.name || "Unknown",
        senderName: user.name || "Unknown",
        amount: transferAmount,
        txn_ref,
      });

      // Success! Show beautiful success modal
      setCompletedTxnRef(txn_ref);
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
      {/* Success Notification */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle
            className="text-green-600 dark:text-green-400 mt-0.5"
            size={20}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              {success}
            </p>
          </div>
          <button
            onClick={() => setSuccess("")}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle
            className="text-red-600 dark:text-red-400 mt-0.5"
            size={20}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle size={24} />
                Confirm Transfer
              </h3>
              <p className="text-indigo-100 text-sm mt-1">
                Please review the transfer details
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Recipient Info */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Recipient
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {recipientData.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {recipientData.email || recipientData.tel}
                </p>
              </div>

              {/* Amount Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
                  <span className="text-gray-600 dark:text-gray-300">
                    Transfer Amount
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    UGX {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
                  <span className="text-gray-600 dark:text-gray-300">Fee</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    UGX 200
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 mt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Debit
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                    UGX {(parseFloat(amount) + 200).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 dark:text-amber-400 mt-0.5"
                />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  This action cannot be undone. Please ensure the details are
                  correct.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
              <button
                onClick={handleCancelTransfer}
                disabled={isTransferring}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isTransferring}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isTransferring ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirm Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && recipientData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-300">
            {/* Header with gradient and animation */}
            <div className="bg-linear-to-br from-green-600 to-emerald-600 p-8 text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-bounce">
                  <PartyPopper size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Transfer Successful!
                </h3>
                <p className="text-green-100">Your money is on its way</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Success checkmark animation */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle
                    size={32}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
              </div>

              {/* Transfer Details */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Sent to
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {recipientData.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {recipientData.email || recipientData.tel}
                    </p>
                  </div>
                  <ArrowRight
                    className="text-green-600 dark:text-green-400 mx-3"
                    size={24}
                  />
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Amount Sent
                    </p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-xl">
                      UGX{" "}
                      {parseFloat(
                        String(transactionAmout) || "0",
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      + UGX 200 Fee
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Transaction ID
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white font-medium">
                      {completedTxnRef}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle size={14} />
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Info message */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-blue-600 dark:text-blue-400 mt-0.5"
                />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Both you and the recipient will receive a notification about
                  this transfer.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(completedTxnRef);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                Copy Ref
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setRecipientData(null);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
