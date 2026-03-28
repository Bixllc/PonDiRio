import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const villaId = request.nextUrl.searchParams.get("id");

  if (!villaId) {
    return NextResponse.json(
      { success: false, error: "Missing required param: id" },
      { status: 400 },
    );
  }

  try {
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricePerNight: true,
        maxGuests: true,
        isActive: true,
      },
    });

    if (!villa) {
      return NextResponse.json(
        { success: false, error: "Villa not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...villa, pricePerNight: villa.pricePerNight.toString() },
    });
  } catch (error) {
    console.error("Villa fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
