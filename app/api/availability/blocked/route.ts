import { NextRequest, NextResponse } from "next/server";
import { getBlockedRanges } from "@/lib/availability";
import { addMonths, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const villaId = req.nextUrl.searchParams.get("villaId");

  if (!villaId) {
    return NextResponse.json(
      { success: false, error: "villaId is required" },
      { status: 400 },
    );
  }

  const today = startOfDay(new Date());
  const sixMonthsAhead = addMonths(today, 6);

  const ranges = await getBlockedRanges(villaId, today, sixMonthsAhead);

  return NextResponse.json({
    success: true,
    data: ranges.map((r) => ({
      start: r.start.toISOString(),
      end: r.end.toISOString(),
    })),
  });
}
