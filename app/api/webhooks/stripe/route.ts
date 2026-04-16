import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { finalizeDeposit } from "@/lib/actions/wallet";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse("Webhook Secret Missing", { status: 400 });
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log("Session", event.data.object);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = event.data.object as any;
  if (event.type === "payment_intent.succeeded") {
    const { userId, transactionReference, type } = session.metadata;

    if (type === "wallet_topup") {
      try {
        await finalizeDeposit({
          userId: parseInt(userId),
          amount: session.amount / 100, // Stripe amount is multiplied by 100 for UGX
          refference: transactionReference,
          method: "Card (Stripe)",
          reason: "Card Top-up via Stripe",
        });

        console.log(
          `Successfully processed deposit for user ${userId}, ref: ${transactionReference}`,
        );
      } catch (error) {
        console.error("Error finalizing deposit from webhook:", error);
        return new NextResponse("Error processing deposit", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
