import { Resend } from "resend";
import { prisma } from "./prisma";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_ADDRESS = "Pon Di Rio <onboarding@resend.dev>";

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
    });
    const checkOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; St. Mary, Jamaica
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
              &copy; ${new Date().getFullYear()} Pon Di Rio &middot; St. Mary, Jamaica
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    // TODO: Change to "pondiriocottages@gmail.com" once domain is verified in Resend
    const { data, error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: "onboarding@resend.dev",
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
