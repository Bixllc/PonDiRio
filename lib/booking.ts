import { prisma } from "./prisma";
import { checkAvailability } from "./availability";

interface CreateBookingInput {
  villaId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  specialRequests?: string;
}

interface CreateBookingResult {
  success: boolean;
  bookingId?: string;
  totalAmount?: string;
  error?: string;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  // 1. Verify villa exists and is active
  const villa = await prisma.villa.findUnique({
    where: { id: input.villaId },
    select: { id: true, pricePerNight: true, maxGuests: true, isActive: true },
  });

  if (!villa) {
    return { success: false, error: "Villa not found" };
  }

  if (!villa.isActive) {
    return { success: false, error: "Villa is not available for booking" };
  }

  // 2. Validate guest count
  if (input.guestCount < 1 || input.guestCount > villa.maxGuests) {
    return {
      success: false,
      error: `Guest count must be between 1 and ${villa.maxGuests}`,
    };
  }

  // 3. Check availability (covers min nights, date order, all three conflict sources)
  const availability = await checkAvailability(
    input.villaId,
    input.checkIn,
    input.checkOut,
  );

  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  // 4. Calculate total
  const nights = Math.round(
    (input.checkOut.getTime() - input.checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  const totalAmount = villa.pricePerNight.mul(nights);

  // 5. Create booking as DRAFT
  const booking = await prisma.booking.create({
    data: {
      villaId: input.villaId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guestCount: input.guestCount,
      specialRequests: input.specialRequests,
      totalAmount,
    },
    select: { id: true, totalAmount: true },
  });

  return {
    success: true,
    bookingId: booking.id,
    totalAmount: booking.totalAmount.toString(),
  };
}
