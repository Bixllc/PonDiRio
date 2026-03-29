import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const villaId = request.nextUrl.searchParams.get("id");

  try {
    // If no id provided, return all active villas
    if (!villaId) {
      const villas = await prisma.villa.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          pricePerNight: true,
          maxGuests: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: villas.map((v) => ({
          ...v,
          pricePerNight: v.pricePerNight.toString(),
        })),
      });
    }

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
