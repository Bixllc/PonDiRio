import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const villaId = params.get("villaId");
  const checkInStr = params.get("checkIn");
  const checkOutStr = params.get("checkOut");

  if (!villaId || !checkInStr || !checkOutStr) {
    return NextResponse.json(
      { success: false, error: "Missing required params: villaId, checkIn, checkOut" },
      { status: 400 },
    );
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return NextResponse.json(
      { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    const result = await checkAvailability(villaId, checkIn, checkOut);

    return NextResponse.json({
      success: true,
      data: { available: result.available, reason: result.reason },
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
