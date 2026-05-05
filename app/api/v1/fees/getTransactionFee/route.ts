import { NextRequest, NextResponse } from "next/server";
import { getTransactionFee } from "@/lib/actions/fee";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getTransactionFeeSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "SUPPORT"]),
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

    const validation = getTransactionFeeSchema.safeParse(body);

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

    const { userId, amount, type } = validation.data;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await getTransactionFee({ amount, type });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error (getTransactionFee):", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
