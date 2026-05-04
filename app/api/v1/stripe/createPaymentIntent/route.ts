import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/actions/stripe";
import { getUserById } from "@/lib/actions/users";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, baseAmount, type } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (amount === undefined || baseAmount === undefined) {
      return NextResponse.json(
        { success: false, message: "Amount and baseAmount are required" },
        { status: 400 },
      );
    }

    if (type === undefined) {
      return NextResponse.json(
        { success: false, message: "Transaction type is required" },
        { status: 400 },
      );
    }

    // Minimum for card payments is UGX 10,000
    if (baseAmount < 10000) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least UGX 10,000" },
        { status: 400 },
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
