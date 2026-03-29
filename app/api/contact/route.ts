import { NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    console.log("[contact] Received submission:", { name, email, phone });

    const result = await sendContactMessage({
      name,
      email,
      phone: phone || "",
      message,
    });

    console.log("[contact] sendContactMessage result:", result);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
