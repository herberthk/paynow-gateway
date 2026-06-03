import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/actions/users";
import { z } from "zod";

const getUserByIdSchema = z.object({
  userId: z.coerce.number().positive("Requester User ID must be a positive number"),
  id: z.coerce.number().positive("Target User ID must be a positive number"),
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

    const validation = getUserByIdSchema.safeParse(body);

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

    const { userId, id } = validation.data;

    // Verify requester exists
    const requester = await getUserById(userId);
    if (!requester) {
      return NextResponse.json(
        { success: false, message: "Requester not found" },
        { status: 404 },
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user:{
       userId: user.id,
       email: user.email,
       tel: user.tel,
       name: user.name,
       profile: user.profile,
       address: user.address,
       ispaid: user.ispaid,
       email_verified_at: user.email_verified_at,
       created_at: user.created_at,
       privilege: user.privilege,
       is_ghost_user: user.is_ghost_user,
      },
    });
  } catch (error) {
    console.error("API Error (getUserById):", error);
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
