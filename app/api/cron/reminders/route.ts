import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleReminders(request: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  if (!syncSecret && !cronSecret) {
    console.error("Neither SYNC_SECRET nor CRON_SECRET is set — reminders route will reject all requests");
  }

  const providedSyncSecret = request.headers.get("x-sync-secret");
  const providedAuth = request.headers.get("authorization");
  const isVercelCron = !!cronSecret && providedAuth === `Bearer ${cronSecret}`;
  const isManualTrigger = !!syncSecret && providedSyncSecret === syncSecret;

  if (!isVercelCron && !isManualTrigger) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await sendDueReminders();

    const failed = results.filter((r) => !r.success);
    const status = failed.length === results.length && results.length > 0 ? 502 : 200;

    return NextResponse.json({ results }, { status });
  } catch (error) {
    console.error("Reminder send error:", error);
    return NextResponse.json({ error: "Reminder send failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleReminders(request);
}

export async function POST(request: NextRequest) {
  return handleReminders(request);
}
