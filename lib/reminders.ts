import { prisma } from "./prisma";
import {
  sendPreArrivalReminder,
  sendCheckInDayReminder,
  sendCheckOutDayReminder,
  sendAdminPreArrivalNotification,
  sendAdminCheckInNotification,
  sendAdminCheckOutNotification,
} from "./email";

function utcDateOnly(offsetDays: number): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

export interface ReminderRunResult {
  type: "pre_arrival" | "check_in" | "check_out" | "admin_pre_arrival" | "admin_check_in" | "admin_check_out";
  bookingId: string;
  success: boolean;
  error?: string;
}

export async function sendDueReminders(): Promise<ReminderRunResult[]> {
  const today = utcDateOnly(0);
  const tomorrow = utcDateOnly(1);
  const results: ReminderRunResult[] = [];

  const preArrivalDue = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: tomorrow,
      preArrivalReminderSentAt: null,
    },
    select: { id: true },
  });
  for (const booking of preArrivalDue) {
    const result = await sendPreArrivalReminder(booking.id);
    results.push({ type: "pre_arrival", bookingId: booking.id, ...result });
    const adminResult = await sendAdminPreArrivalNotification(booking.id);
    results.push({ type: "admin_pre_arrival", bookingId: booking.id, ...adminResult });
  }

  const checkInDue = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: today,
      checkInReminderSentAt: null,
    },
    select: { id: true },
  });
  for (const booking of checkInDue) {
    const result = await sendCheckInDayReminder(booking.id);
    results.push({ type: "check_in", bookingId: booking.id, ...result });
    const adminResult = await sendAdminCheckInNotification(booking.id);
    results.push({ type: "admin_check_in", bookingId: booking.id, ...adminResult });
  }

  const checkOutDue = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkOut: today,
      checkOutReminderSentAt: null,
    },
    select: { id: true },
  });
  for (const booking of checkOutDue) {
    const result = await sendCheckOutDayReminder(booking.id);
    results.push({ type: "check_out", bookingId: booking.id, ...result });
    const adminResult = await sendAdminCheckOutNotification(booking.id);
    results.push({ type: "admin_check_out", bookingId: booking.id, ...adminResult });
  }

  return results;
}
