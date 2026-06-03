import { NextRequest, NextResponse } from "next/server";
import { processP2PTransfer } from "@/lib/actions/wallet";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const processP2PTransferSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  recipientId: z.coerce.number().positive("Recipient ID must be a positive number"),
  amount: z.coerce.number().min(500, "Transfer amount must be at least UGX 500"),
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

    const validation = processP2PTransferSchema.safeParse(body);

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

    const { userId, recipientId, amount } = validation.data;

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await processP2PTransfer(
      userId,
      recipientId,
      amount,
      user,
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error (processP2PTransfer):", error);
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
