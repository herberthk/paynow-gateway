import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/lib/actions/users";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const searchUsersSchema = z.object({
  userId: z.coerce.number().positive("User ID must be a positive number"),
  query: z.string().min(1, "Search query is required"),
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

    const validation = searchUsersSchema.safeParse(body);

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

    const { userId, query } = validation.data;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const result = await searchUsers(query, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error (searchUsers):", error);
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
