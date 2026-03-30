import { NextRequest, NextResponse } from "next/server";
import { verifyFacCallback } from "@/lib/payments";

/**
 * FAC/PowerTranz posts back here as multipart/form-data with a single
 * field "Response" containing a JSON-encoded string.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const responseField = formData.get("Response");

    if (!responseField || typeof responseField !== "string") {
      return NextResponse.json(
        { error: "Missing Response field" },
        { status: 400 },
      );
    }

    const result = await verifyFacCallback(responseField);

    if (result.success) {
      // Redirect to booking confirmation page
      const confirmUrl = new URL(
        `/booking/confirmation?bookingId=${result.bookingId}`,
        request.url,
      );
      return NextResponse.redirect(confirmUrl, 303);
    }

    // Payment failed — redirect to failure page
    const failUrl = new URL(
      `/booking/failed?id=${result.bookingId || ""}&reason=${encodeURIComponent(result.error || "Payment failed")}`,
      request.url,
    );
    return NextResponse.redirect(failUrl, 303);
  } catch (error) {
    console.error("FAC callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
