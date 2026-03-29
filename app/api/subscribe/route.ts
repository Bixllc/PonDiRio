import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      console.error("[subscribe] RESEND_AUDIENCE_ID is not set");
      return NextResponse.json(
        { success: false, error: "Subscription is not configured" },
        { status: 500 },
      );
    }

    const { error } = await resend.contacts.create({
      audienceId,
      email,
    });

    if (error) {
      console.error("[subscribe] Failed to add contact:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
