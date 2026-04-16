"use server";

import { stripe } from "@/lib/stripe";
import { getUserSession } from "./session";
import { generateTxRef } from "@/utils";

/**
 * Create a Stripe PaymentIntent for wallet top-up
 * @param amount - Amount in UGX
 * @returns Client secret for the PaymentIntent
 */
export async function createPaymentIntent(amount: number) {
  try {
    const user = await getUserSession();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (amount < 5000) {
       // Stripe has a minimum amount for some currencies, usually ~$0.50. 
       // 5000 UGX is roughly $1.30, which is safe.
      throw new Error("Minimum card top-up is UGX 5,000");
    }

    const transactionReference = await generateTxRef();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe requires UGX to be multiplied by 100
      currency: "ugx",
      metadata: {
        userId: user.id.toString(),
        transactionReference,
        type: "wallet_topup",
      },
      description: `Wallet top-up for ${user.name || user.email}`,
      // Optionally link to a customer if they exist in Stripe
      // customer: user.stripeCustomerId, 
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionReference,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to initialize payment");
  }
}
