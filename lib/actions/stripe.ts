"use server";

import { stripe } from "@/lib/stripe";
import { getUserSession } from "./session";
import { generateTxRef } from "@/utils";

/**
 * Core Stripe PaymentIntent logic — accepts a pre-authenticated user.
 * @internal
 */
export async function _createPaymentIntentCore(
  user: User,
  {
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
  },
) {
  if (!type) throw new Error("Transaction type is required");
  if (amount < 5000) throw new Error("Minimum card top-up is UGX 5,000");

  const transactionReference = await generateTxRef();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "ugx",
    metadata: {
      userId: user.id.toString(),
      transactionReference,
      baseAmount: baseAmount.toString(),
      type,
      ...(toUserId && { toUserId: toUserId.toString() }),
      ...(fromUserId && { fromUserId: fromUserId.toString() }),
    },
    description: `${type} for ${user.name || user.email}`,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    transactionReference,
  };
}

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
    return _createPaymentIntentCore(user, {
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
