import "server-only";

import { stripe } from "@/lib/stripe";
import { generateTxRef } from "@/utils";

/** Stripe PaymentIntent logic for trusted server callers. */
export async function createPaymentIntentForUser(
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
