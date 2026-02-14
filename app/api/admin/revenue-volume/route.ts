import { NextRequest, NextResponse } from "next/server";
import { getRevenueVolumeData } from "@/lib/actions/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period =
      (searchParams.get("period") as "daily" | "weekly" | "monthly") || "daily";

    const data = await getRevenueVolumeData(period);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in revenue volume API:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue volume data" },
      { status: 500 },
    );
  }
}
