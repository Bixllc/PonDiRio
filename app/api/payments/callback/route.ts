import { NextRequest, NextResponse } from "next/server";
import { verifyFacCallback } from "@/lib/payments";

const SITE_URL = "https://pon-di-rio.vercel.app";

/** Redirect the browser after payment callback. */
function redirect(url: string) {
  return NextResponse.redirect(url, 303);
}

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
      return redirect(`${SITE_URL}/booking?error=missing_response`);
    }

    console.log("[FAC Callback] Response field length:", responseField.length);
    const result = await verifyFacCallback(responseField);
    console.log("[FAC Callback] verifyFacCallback result:", JSON.stringify(result));

    if (result.success) {
      const confirmUrl = `${SITE_URL}/booking/confirmation?bookingId=${result.bookingId}`;
      console.log("[FAC Callback] Redirecting to:", confirmUrl);
      return redirect(confirmUrl);
    }

    // Payment failed
    const failUrl = `${SITE_URL}/booking/failed?id=${result.bookingId || ""}&reason=${encodeURIComponent(result.error || "Payment failed")}`;
    console.log("[FAC Callback] Payment failed, redirecting to:", failUrl);
    return redirect(failUrl);
  } catch (error) {
    console.error("[FAC Callback] Error:", error);
    return redirect(`${SITE_URL}/booking?error=internal`);
  }
}
