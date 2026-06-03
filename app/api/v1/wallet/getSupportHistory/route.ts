import { NextRequest, NextResponse } from "next/server";
import { getSupportHistory } from "@/lib/actions/support";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getSupportHistorySchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  page: z.coerce.number().positive("Page must be a positive number").optional(),
  pageSize: z.coerce.number().positive("Page size must be a positive number").optional(),
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

    const validation = getSupportHistorySchema.safeParse(body);

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

    const { userId, page, pageSize } = validation.data;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await getSupportHistory({
      userId,
      page: page || 1,
      pageSize: pageSize || 10,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error (getSupportHistory):", error);
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
