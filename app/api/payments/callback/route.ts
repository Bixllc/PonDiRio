import { NextRequest, NextResponse } from "next/server";
import { verifyFacCallback } from "@/lib/payments";

const SITE_URL = "https://pon-di-rio.vercel.app";

/**
 * FAC/PowerTranz posts back here as multipart/form-data with a single
 * field "Response" containing a JSON-encoded string.
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[FAC Callback] Received POST, request.url:", request.url);

    const formData = await request.formData();
    const responseField = formData.get("Response");

    if (!responseField || typeof responseField !== "string") {
      console.log("[FAC Callback] Missing Response field");
      return NextResponse.json(
        { error: "Missing Response field" },
        { status: 400 },
      );
    }

    console.log("[FAC Callback] Response field length:", responseField.length);
    const result = await verifyFacCallback(responseField);
    console.log("[FAC Callback] verifyFacCallback result:", JSON.stringify(result));

    if (result.success) {
      const confirmUrl = `${SITE_URL}/booking/confirmation?bookingId=${result.bookingId}`;
      console.log("[FAC Callback] Redirecting to:", confirmUrl);
      return NextResponse.redirect(confirmUrl, 303);
    }

    // Payment failed — redirect to failure page
    const failUrl = `${SITE_URL}/booking/failed?id=${result.bookingId || ""}&reason=${encodeURIComponent(result.error || "Payment failed")}`;
    console.log("[FAC Callback] Payment failed, redirecting to:", failUrl);
    return NextResponse.redirect(failUrl, 303);
  } catch (error) {
    console.error("[FAC Callback] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
