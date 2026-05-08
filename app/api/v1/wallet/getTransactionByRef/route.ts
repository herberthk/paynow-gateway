import { NextRequest, NextResponse } from "next/server";
import { getTransactionByRef } from "@/lib/actions/wallet";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getTransactionByRefSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  reference: z.string().min(1, "Reference is required"),
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

    const validation = getTransactionByRefSchema.safeParse(body);

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

    const { userId, reference } = validation.data;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Pass the userId to verify the transaction belongs to the user
    const result = await getTransactionByRef({
      ref: reference,
      providedUser: user as unknown as User,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    // Security check: ensure the transaction belongs to the requested userId
    // Note: getTransactionByRef already checks session user, but since this is an API
    // for third-party apps using userId, we should ensure the transaction matches the provided userId.
    if (
      result.transaction?.userId !== userId &&
      result.transaction?.recipientId !== userId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to transaction" },
        { status: 403 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error (getTransactionByRef):", error);
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
