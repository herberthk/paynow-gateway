import { NextRequest, NextResponse } from "next/server";
import { verifyMsisdnAction } from "@/lib/actions/msisdn";
import { z } from "zod";

const verifyMsisdnSchema = z.object({
  msisdn: z
    .string()
    .min(1, "Phone number is required")
    .trim(),
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

    const validation = verifyMsisdnSchema.safeParse(body);

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

    const { msisdn } = validation.data;

    const result = await verifyMsisdnAction(msisdn);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error (verifyMsisdn):", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
