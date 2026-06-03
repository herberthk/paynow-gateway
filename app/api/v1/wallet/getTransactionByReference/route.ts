import { NextRequest, NextResponse } from "next/server";
import { getTransactionByReference } from "@/lib/actions/transactions";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getTransactionByReferenceSchema = z.object({
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

    const validation = getTransactionByReferenceSchema.safeParse(body);

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

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await getTransactionByReference(reference, user);

    if (result && "error" in result) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      transaction: result,
    });
  } catch (error) {
    console.error("API Error (getTransactionByReference):", error);
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
