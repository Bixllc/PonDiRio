import { NextRequest, NextResponse } from "next/server";
import { verifyFacCallback } from "@/lib/payments";

const SITE_URL = "https://pon-di-rio.vercel.app";

/**
 * Return an HTML page that breaks out of the iframe by setting
 * window.top.location. A plain 303 redirect stays inside the iframe.
 */
function topRedirect(url: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>window.top.location.href=${JSON.stringify(url)};</script>
<noscript><a href="${url}">Click here to continue</a></noscript>
</body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
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
      return topRedirect(`${SITE_URL}/booking?error=missing_response`);
    }

    console.log("[FAC Callback] Response field length:", responseField.length);
    const result = await verifyFacCallback(responseField);
    console.log("[FAC Callback] verifyFacCallback result:", JSON.stringify(result));

    if (result.success) {
      const confirmUrl = `${SITE_URL}/booking/confirmation?bookingId=${result.bookingId}`;
      console.log("[FAC Callback] Redirecting to:", confirmUrl);
      return topRedirect(confirmUrl);
    }

    // Payment failed
    const failUrl = `${SITE_URL}/booking/failed?id=${result.bookingId || ""}&reason=${encodeURIComponent(result.error || "Payment failed")}`;
    console.log("[FAC Callback] Payment failed, redirecting to:", failUrl);
    return topRedirect(failUrl);
  } catch (error) {
    console.error("[FAC Callback] Error:", error);
    return topRedirect(`${SITE_URL}/booking?error=internal`);
  }
}
