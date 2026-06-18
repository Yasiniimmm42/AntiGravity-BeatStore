import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getSessionToken, verifyPassword } from "@/lib/auth";

// Basit in-memory rate limit: brute-force şifre denemelerini IP başına sınırlar.
// Tek sunuculu/tek-admin demo kapsamı için yeterli; çoklu instance'ta paylaşılmaz.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string) {
  const entry = attempts.get(ip);
  if (entry) entry.count++;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const { password } = await req.json();

    if (typeof password !== "string" || !verifyPassword(password)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
    }

    attempts.delete(ip);

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, getSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Giriş işlemi başarısız." }, { status: 500 });
  }
}
