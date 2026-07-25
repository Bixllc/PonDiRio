import { Resend } from "resend";
import { prisma } from "./prisma";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_ADDRESS = "Pon Di Rio <bookings@pondiriorivercottagesja.com>";
const ADMIN_EMAIL = "pondiriocottages@gmail.com";

interface SendResult {
  success: boolean;
  error?: string;
}

export async function sendBookingConfirmation(
  bookingId: string,
): Promise<SendResult> {
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { villa: { select: { name: true } } },
    });

    const checkIn = booking.checkIn.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const checkOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const total = `USD $${Number(booking.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C8940A;font-weight:normal;letter-spacing:1px;">
              Pon Di Rio
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
              Booking Confirmed
            </h2>
            <div style="width:40px;height:2px;background-color:#C8940A;margin-bottom:24px;"></div>

            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
              Thank you, <strong>${booking.guestName}</strong>. Your payment was successful and your stay is confirmed.
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:6px;padding:24px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Booking ID</td>
                    <td style="padding:0 0 12px;font-size:15px;color:#1a1a2e;text-align:right;font-family:monospace;">${booking.id}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Villa</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${booking.villa.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-in</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${checkIn}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-out</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${checkOut}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Total Paid</td>
                    <td style="padding:12px 0 0;font-size:17px;color:#C8940A;text-align:right;font-weight:bold;border-top:1px solid #e0dcd4;">${total}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
              We look forward to welcoming you. If you have any questions, simply reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#888;">
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; Retreat, St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: booking.guestEmail,
      subject: `Booking Confirmed — ${booking.villa.name}`,
      html,
    });

    if (error) {
      console.error("[email] Failed to send confirmation:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send confirmation:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Admin Booking Notification ────────────────────────────

export async function sendAdminBookingNotification(
  bookingId: string,
): Promise<SendResult> {
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { villa: { select: { name: true } } },
    });

    const checkIn = booking.checkIn.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const checkOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const total = `USD $${Number(booking.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C8940A;font-weight:normal;letter-spacing:1px;">
              Pon Di Rio
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
              New Booking Confirmed
            </h2>
            <div style="width:40px;height:2px;background-color:#C8940A;margin-bottom:24px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:6px;padding:24px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Booking ID</td>
                    <td style="padding:0 0 12px;font-size:15px;color:#1a1a2e;text-align:right;font-family:monospace;">${booking.id}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Villa</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${booking.villa.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Guest</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${booking.guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Email</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">
                      <a href="mailto:${booking.guestEmail}" style="color:#C8940A;">${booking.guestEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-in</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${checkIn}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-out</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${checkOut}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Total Paid</td>
                    <td style="padding:12px 0 0;font-size:17px;color:#C8940A;text-align:right;font-weight:bold;border-top:1px solid #e0dcd4;">${total}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#888;">
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; Retreat, St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `New Booking — ${booking.villa.name} (${booking.guestName})`,
      html,
    });

    if (error) {
      console.error("[email] Failed to send admin booking notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send admin booking notification:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Stay Reminders ─────────────────────────────────────────

function buildReminderHtml(opts: {
  heading: string;
  intro: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C8940A;font-weight:normal;letter-spacing:1px;">
              Pon Di Rio
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
              ${opts.heading}
            </h2>
            <div style="width:40px;height:2px;background-color:#C8940A;margin-bottom:24px;"></div>

            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
              ${opts.intro}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:6px;padding:24px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Villa</td>
                    <td style="padding:0 0 12px;font-size:15px;color:#1a1a2e;text-align:right;">${opts.villaName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-in</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${opts.checkIn} · 3:00 PM</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-out</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${opts.checkOut} · 11:00 AM</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
              If you have any questions, simply reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#888;">
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; Retreat, St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

async function sendReminderEmail(opts: {
  bookingId: string;
  subject: string;
  heading: string;
  intro: string;
  timestampField: "preArrivalReminderSentAt" | "checkInReminderSentAt" | "checkOutReminderSentAt";
}): Promise<SendResult> {
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: opts.bookingId },
      include: { villa: { select: { name: true } } },
    });

    const checkIn = booking.checkIn.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const checkOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const html = buildReminderHtml({
      heading: opts.heading,
      intro: opts.intro.replace("{guestName}", booking.guestName),
      villaName: booking.villa.name,
      checkIn,
      checkOut,
    });

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: booking.guestEmail,
      subject: opts.subject,
      html,
    });

    if (error) {
      console.error(`[email] Failed to send ${opts.timestampField}:`, error);
      return { success: false, error: error.message };
    }

    await prisma.booking.update({
      where: { id: opts.bookingId },
      data: { [opts.timestampField]: new Date() },
    });

    return { success: true };
  } catch (err) {
    console.error(`[email] Failed to send ${opts.timestampField}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function sendPreArrivalReminder(bookingId: string): Promise<SendResult> {
  return sendReminderEmail({
    bookingId,
    subject: "Your Pon Di Rio Stay Begins Tomorrow",
    heading: "See You Tomorrow",
    intro: "Hi {guestName}, just a friendly reminder that your stay begins tomorrow. We're looking forward to welcoming you.",
    timestampField: "preArrivalReminderSentAt",
  });
}

export async function sendCheckInDayReminder(bookingId: string): Promise<SendResult> {
  return sendReminderEmail({
    bookingId,
    subject: "Today's the Day — Check-In at Pon Di Rio",
    heading: "Today's the Day",
    intro: "Hi {guestName}, today is your check-in day. Your villa will be ready from 3:00 PM — we can't wait to welcome you.",
    timestampField: "checkInReminderSentAt",
  });
}

export async function sendCheckOutDayReminder(bookingId: string): Promise<SendResult> {
  return sendReminderEmail({
    bookingId,
    subject: "Check-Out Today — Thank You for Staying with Pon Di Rio",
    heading: "Check-Out Today",
    intro: "Hi {guestName}, today is your check-out day. Check-out is by 11:00 AM. Thank you for staying with us — we hope you had a wonderful time.",
    timestampField: "checkOutReminderSentAt",
  });
}

// ─── Admin Reminder Notifications ──────────────────────────

function buildAdminReminderHtml(opts: {
  heading: string;
  note: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C8940A;font-weight:normal;letter-spacing:1px;">
              Pon Di Rio
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
              ${opts.heading}
            </h2>
            <div style="width:40px;height:2px;background-color:#C8940A;margin-bottom:24px;"></div>

            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
              ${opts.note}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:6px;padding:24px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Villa</td>
                    <td style="padding:0 0 12px;font-size:15px;color:#1a1a2e;text-align:right;">${opts.villaName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Guest</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${opts.guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Email</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">
                      <a href="mailto:${opts.guestEmail}" style="color:#C8940A;">${opts.guestEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-in</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${opts.checkIn} · 3:00 PM</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Check-out</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;border-top:1px solid #e0dcd4;">${opts.checkOut} · 11:00 AM</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#888;">
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; Retreat, St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

async function sendAdminReminderNotification(opts: {
  bookingId: string;
  subject: string;
  heading: string;
  note: string;
}): Promise<SendResult> {
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: opts.bookingId },
      include: { villa: { select: { name: true } } },
    });

    const checkIn = booking.checkIn.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const checkOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const html = buildAdminReminderHtml({
      heading: opts.heading,
      note: opts.note,
      villaName: booking.villa.name,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      checkIn,
      checkOut,
    });

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: opts.subject,
      html,
    });

    if (error) {
      console.error("[email] Failed to send admin reminder notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send admin reminder notification:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function sendAdminPreArrivalNotification(bookingId: string): Promise<SendResult> {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { guestName: true },
  });
  return sendAdminReminderNotification({
    bookingId,
    subject: `${booking.guestName} Arrives Tomorrow`,
    heading: "Guest Arriving Tomorrow",
    note: `${booking.guestName} is arriving tomorrow.`,
  });
}

export async function sendAdminCheckInNotification(bookingId: string): Promise<SendResult> {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { guestName: true },
  });
  return sendAdminReminderNotification({
    bookingId,
    subject: `${booking.guestName} Checking In Today`,
    heading: "Guest Checking In Today",
    note: `${booking.guestName} is checking in today.`,
  });
}

export async function sendAdminCheckOutNotification(bookingId: string): Promise<SendResult> {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { guestName: true },
  });
  return sendAdminReminderNotification({
    bookingId,
    subject: `${booking.guestName} Checking Out Today`,
    heading: "Guest Checking Out Today",
    note: `${booking.guestName} is checking out today.`,
  });
}

// ─── Contact Message ──────────────────────────────────────

interface ContactMessageInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<SendResult> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C8940A;font-weight:normal;letter-spacing:1px;">
              Pon Di Rio
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
              New Contact Message
            </h2>
            <div style="width:40px;height:2px;background-color:#C8940A;margin-bottom:24px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:6px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Name</td>
                    <td style="padding:0 0 12px;font-size:15px;color:#1a1a2e;text-align:right;">${input.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Email</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">
                      <a href="mailto:${input.email}" style="color:#C8940A;">${input.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #e0dcd4;">Phone</td>
                    <td style="padding:12px 0;font-size:15px;color:#1a1a2e;text-align:right;">${input.phone}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <h3 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1a1a2e;font-weight:normal;">Message</h3>
            <p style="margin:0;font-size:15px;color:#444;line-height:1.6;white-space:pre-wrap;">${input.message}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#888;">
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; Retreat, St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    const { data, error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      replyTo: input.email,
      subject: `Contact from ${input.name}`,
      html,
    });

    console.log("[email] Contact message result:", { data, error });

    if (error) {
      console.error("[email] Failed to send contact message:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send contact message:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
