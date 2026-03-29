"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_TOKEN = "admin_authenticated";

function createCookieValue(secret: string): string {
  const signature = createHmac("sha256", secret)
    .update(SESSION_TOKEN)
    .digest("hex");
  return `${SESSION_TOKEN}.${signature}`;
}

export async function adminLogin(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    return { error: "Server configuration error." };
  }

  if (!password || password !== adminPassword) {
    return { error: "Invalid password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createCookieValue(sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin/bookings");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}
