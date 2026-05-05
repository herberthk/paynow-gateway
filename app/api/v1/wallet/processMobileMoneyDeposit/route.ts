import { NextRequest, NextResponse } from "next/server";
import { processMobileMoneyDeposit } from "@/lib/actions/wallet";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const processMobileMoneyDepositSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  amount: z.coerce.number().min(1000, "Amount must be at least UGX 1000"),
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

    const validation = processMobileMoneyDepositSchema.safeParse(body);

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

    const { userId, amount } = validation.data;

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await processMobileMoneyDeposit({
      amount,
      providedUser: user,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error (processMobileMoneyDeposit):", error);
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
