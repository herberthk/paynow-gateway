"use server";

import { getUserSession } from "./session";
import { createPaymentIntentForUser } from "@/lib/server/payment-core";

/**
 * Create a Stripe PaymentIntent for wallet top-up — public Server Action.
 * Authenticates via session cookie, then delegates to the core.
 */
export async function createPaymentIntent({
  amount,
  baseAmount,
  type,
  toUserId,
  fromUserId,
}: {
  amount: number;
  baseAmount: number;
  type: TransactionReason;
  toUserId?: number;
  fromUserId?: number;
}) {
  try {
    const user = await getUserSession();
    if (!user) throw new Error("Unauthorized");
    return createPaymentIntentForUser(user, {
      amount,
      baseAmount,
      type,
      toUserId,
      fromUserId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to initialize payment",
    );
  }
}
