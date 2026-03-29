import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const SESSION_TOKEN = "admin_authenticated";

async function hmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyCookieValue(
  value: string,
  secret: string
): Promise<boolean> {
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  const expected = await hmacHex(secret, token);
  return expected === signature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie || !(await verifyCookieValue(cookie.value, secret))) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
