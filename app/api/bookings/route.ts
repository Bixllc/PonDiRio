import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { success: false, error: "Request body must be a JSON object" },
      { status: 400 },
    );
  }

  const { villaId, guestName, guestEmail, guestPhone, checkIn, checkOut, guestCount, specialRequests } =
    body as Record<string, unknown>;

  // Validate required fields
  const missing: string[] = [];
  if (!villaId || typeof villaId !== "string") missing.push("villaId");
  if (!guestName || typeof guestName !== "string") missing.push("guestName");
  if (!guestEmail || typeof guestEmail !== "string") missing.push("guestEmail");
  if (!checkIn || typeof checkIn !== "string") missing.push("checkIn");
  if (!checkOut || typeof checkOut !== "string") missing.push("checkOut");
  if (guestCount === undefined || typeof guestCount !== "number") missing.push("guestCount");

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing or invalid fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const checkInDate = new Date(checkIn as string);
  const checkOutDate = new Date(checkOut as string);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return NextResponse.json(
      { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    const result = await createBooking({
      villaId: villaId as string,
      guestName: guestName as string,
      guestEmail: guestEmail as string,
      guestPhone: typeof guestPhone === "string" ? guestPhone : undefined,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestCount: guestCount as number,
      specialRequests: typeof specialRequests === "string" ? specialRequests : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { bookingId: result.bookingId, totalAmount: result.totalAmount },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
