import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getSessionToken, verifyPassword } from "@/lib/auth";
import { isRateLimited, recordFailedAttempt, resetAttempts } from "@/lib/rateLimit";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const key = `login:${getClientIp(req)}`;

    if (await isRateLimited(key)) {
      return NextResponse.json(
        { error: "Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const { password } = await req.json();

    if (typeof password !== "string" || !verifyPassword(password)) {
      await recordFailedAttempt(key);
      return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
    }

    await resetAttempts(key);

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
