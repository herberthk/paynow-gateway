import { NextRequest, NextResponse } from "next/server";
import { processMobileMoneyDeposit } from "@/lib/actions/wallet";
import { getUserById } from "@/lib/actions/users";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = (await req.json()) as TransferMobileRequestBody;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = (await getUserById(userId)) as unknown as User;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least UGX 1000" },
        { status: 400 },
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
