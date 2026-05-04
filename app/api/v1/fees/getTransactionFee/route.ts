import { NextRequest, NextResponse } from "next/server";
import { getTransactionFee } from "@/lib/actions/fee";
import { getUserById } from "@/lib/actions/users";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, type } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!amount || !type) {
      return NextResponse.json(
        { success: false, message: "Amount and type are required" },
        { status: 400 }
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
      { status: 500 }
    );
  }
}
