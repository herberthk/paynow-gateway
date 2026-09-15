import { NextRequest, NextResponse } from "next/server";
import { _processWalletSupportCore } from "@/lib/server/support-core";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const processWalletSupportSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  toUserId: z.coerce
    .number()
    .positive("Recipient ID must be a positive number"),
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

    const validation = processWalletSupportSchema.safeParse(body);

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

    const { userId, toUserId, amount } = validation.data;

    // Simulate session authentication for third party usage by verifying the user exists
    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await _processWalletSupportCore({
      sender: user,
      senderId: userId,
      recipientId: toUserId,
      amount,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error (processWalletSupport):", error);
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
