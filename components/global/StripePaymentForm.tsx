"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (txRef: string) => void;
  onCancel: () => void;
  transactionReference: string;
}

export const StripePaymentForm = ({
  amount,
  onSuccess,
  onCancel,
  transactionReference,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // We handle the success state manually if no redirect is needed
      confirmParams: {
        // Return URL is required even if redirect is if_required
        return_url: `${window.location.origin}/dashboard/user/wallet/topup/success?ref=${transactionReference}`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred with your card.");
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment finalized!
      onSuccess(transactionReference);
    } else {
      // Most likely a redirect was required and handled by Stripe
      // Or payment is pending
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      id="payment-form"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-4 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Recharge Amount
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            UGX {amount.toLocaleString()}
          </p>
        </div>
        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <ShieldCheck size={24} />
        </div>
      </div>

      <div className="p-1">
        <PaymentElement
          options={{
            layout: "tabs",
            //@ts-ignore
            theme: "night", // We'll handle theme dynamically or via appearance prop in parent
          }}
        />
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2 flex flex-col gap-3">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 group"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              Confirm Payment
              <ShieldCheck
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Cancel and go back
        </button>
      </div>

      <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 leading-relaxed px-4">
        Your payment is secured by Stripe. PayNow does not store your card
        details. By continuing, you agree to our terms of service.
      </p>
    </motion.form>
  );
};
