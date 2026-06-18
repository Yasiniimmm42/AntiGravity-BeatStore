import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkDiscountValidity, normalizeDiscountCode } from "@/lib/discounts";
import { isRateLimited, recordFailedAttempt, resetAttempts } from "@/lib/rateLimit";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Herkese açık (sepet/checkout akışı için kimlik doğrulaması gerektirmez),
// ama kupon kodu brute-force taramasını engellemek için IP bazlı rate limit var.
export async function POST(req: NextRequest) {
  try {
    const rateLimitKey = `discount-validate:${getClientIp(req)}`;
    if (await isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { valid: false, error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const { code } = await req.json();
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, error: "Kupon kodu zorunludur." }, { status: 400 });
    }

    const discount = await prisma.discount.findUnique({ where: { code: normalizeDiscountCode(code) } });
    const result = checkDiscountValidity(discount);

    if (!result.valid) {
      await recordFailedAttempt(rateLimitKey);
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }

    await resetAttempts(rateLimitKey);
    return NextResponse.json({ valid: true, discountPercent: discount!.discountPercent });
  } catch (error) {
    console.error("Error validating discount:", error);
    return NextResponse.json({ valid: false, error: "Kupon doğrulanamadı." }, { status: 500 });
  }
}
