import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { finalizeDeposit } from "@/lib/actions/wallet";
import type Stripe from "stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook Secret Missing", { status: 400 });
  }
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // ✅ Idempotency guard — Stripe retries failed/slow webhooks,
  // so the same event can arrive more than once.
  const alreadyProcessed = await prisma.processedWebhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (alreadyProcessed) {
    console.log(`Duplicate webhook event skipped: ${event.id}`);
    // Must return 200, or Stripe will keep retrying
    return new NextResponse(null, { status: 200 });
  }
  // console.log("Session", event.data.object);

  if (event.type === "charge.succeeded") {
    console.log("Event ID from route", event.id);
    // ✅ Properly typed instead of `as any`
    const charge = event.data.object as Stripe.Charge;
    const { userId, transactionReference, type, baseAmount } =
      charge.metadata ?? {};

    if (type === "wallet_topup") {
      if (!userId || !transactionReference || !baseAmount) {
        console.error("Missing required metadata on charge:", charge.id);
        // Return 200 anyway — a 4xx/5xx here causes Stripe to retry forever
        // but the data is malformed so retrying won't help.
        return new NextResponse(null, { status: 200 });
      }

      try {
        await finalizeDeposit({
          stripeEventId: event.id, // ✅ Pass event ID for idempotency inside the tx
          userId: parseInt(userId, 10), // ✅ Always pass radix to parseInt
          amount: parseFloat(baseAmount),
          refference: transactionReference,
          method: "Card (Stripe)",
          reason: "Card Top-up via Stripe",
          paymentMethod: "CARD",
          receiptUrl: charge.receipt_url ?? undefined,
        });

        console.log(
          `Processed charge ${charge.id} for user ${userId}, ref: ${transactionReference}`,
        );
      } catch (error) {
        console.error("Error finalizing deposit from webhook:", error);
        // Return 500 so Stripe retries — but only AFTER idempotency
        // is handled inside finalizeDeposit, otherwise retries cause
        // the double-charge bug you hit before.
        return new NextResponse("Error processing deposit", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
