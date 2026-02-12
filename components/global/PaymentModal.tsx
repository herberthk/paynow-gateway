"use client";
import { useState } from "react";
import { X, Smartphone, CreditCard, Banknote, QrCode } from "lucide-react";
import { useAppStore } from "@/store";

const PaymentModal = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("momo");
  const [step, setStep] = useState(1);

  const paymentModal = useAppStore((state) => state.paymentModal);
  const closePaymentModal = useAppStore((state) => state.closePaymentModal);

  if (!paymentModal.isOpen) return null;

  const title =
    paymentModal.type === "deposit" ? "Top Up Wallet" : "Withdraw Funds";

  const renderMethodSelect = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => setSelectedMethod("momo")}
        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedMethod === "momo" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300"}`}
      >
        <Smartphone size={24} />
        <span className="font-medium text-sm">Mobile Money</span>
      </button>
      <button
        onClick={() => setSelectedMethod("card")}
        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedMethod === "card" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300"}`}
      >
        <CreditCard size={24} />
        <span className="font-medium text-sm">Card</span>
      </button>
      <button
        onClick={() => setSelectedMethod("ussd")}
        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedMethod === "ussd" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300"}`}
      >
        <Banknote size={24} />
        <span className="font-medium text-sm">USSD</span>
      </button>
      {paymentModal.type === "deposit" && (
        <button
          onClick={() => setSelectedMethod("qr")}
          className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedMethod === "qr" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300"}`}
        >
          <QrCode size={24} />
          <span className="font-medium text-sm">QR Code</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-700/50">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={closePaymentModal}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select payment method:
              </p>
              {renderMethodSelect()}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                    UGX
                  </span>
                  <input
                    type="number"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg pl-12 pr-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                {paymentModal.type === "withdraw" && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    A withdrawal fee of 1.5% applies.
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400 animate-pulse">
                <Smartphone size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Check your phone
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                We&apos;ve sent a prompt to your mobile number. Please enter
                your PIN to complete the transaction.
              </p>
              <button
                onClick={closePaymentModal}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Close and wait for confirmation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
