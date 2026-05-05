import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/actions/stripe";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const createPaymentIntentSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  amount: z.coerce.number().positive("Amount must be positive"),
  baseAmount: z.coerce.number().min(10000, "Amount must be at least UGX 10,000"),
  type: z.enum(["wallet_topup", "payment", "transfer", "support"]),
});

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or missing request body" },
        { status: 400 },
      );
    }

    const validation = createPaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const { userId, amount, baseAmount, type } = validation.data;

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await createPaymentIntent({
      amount,
      baseAmount,
      providedUser: user,
      type,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (createPaymentIntent):", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

