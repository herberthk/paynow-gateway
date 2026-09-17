"use client";

import { memo, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/global/StripePaymentForm";
import type { StepCardPaymentProps } from "./types";

export const StepCardPayment = memo(function StepCardPayment({
  amount,
  txRef,
  clientSecret,
  onCancel,
  onSuccess,
}: StepCardPaymentProps) {
  const [stripePromise] = useState(() => getStripe());

  const stripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? "",
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#0f172a",
          colorText: "#ffffff",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "16px",
        },
        rules: {
          ".Input": {
            border: "1px solid #1e293b",
            backgroundColor: "#1e293b",
            padding: "12px",
          },
        },
      } as Appearance,
    }),
    [clientSecret]
  );

  if (!clientSecret) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Secure Card Payment
      </h2>
      <Elements stripe={stripePromise} options={stripeElementsOptions}>
        <StripePaymentForm
          amount={parseFloat(amount || "0")}
          transactionReference={txRef}
          onCancel={onCancel}
          onSuccess={onSuccess}
        />
      </Elements>
    </div>
  );
});
