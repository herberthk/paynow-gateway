import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/actions/transactions";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getTransactionsSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  page: z.coerce.number().positive("Page must be a positive number").optional(),
  limit: z.coerce.number().positive("Limit must be a positive number").optional(),
  query: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
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

    const validation = getTransactionsSchema.safeParse(body);

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

    const { userId, page, limit, query, status, type } = validation.data;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await getTransactions({
      page: page || 1,
      limit: limit || 10,
      query: query || "",
      status: status,
      type: type,
      providedUser: user as unknown as User,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getTransactions):", error);
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
