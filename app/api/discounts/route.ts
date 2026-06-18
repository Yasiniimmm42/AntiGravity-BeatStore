import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedRequest } from "@/lib/auth";
import { normalizeDiscountCode } from "@/lib/discounts";

export async function GET(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(discounts);
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { code, discountPercent, maxUses, expiresAt } = data as {
      code?: string;
      discountPercent?: number;
      maxUses?: number | null;
      expiresAt?: string | null;
    };

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Kupon kodu zorunludur." }, { status: 400 });
    }

    const percent = Number(discountPercent);
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      return NextResponse.json({ error: "İndirim yüzdesi 1-100 arasında bir tam sayı olmalıdır." }, { status: 400 });
    }

    let normalizedMaxUses: number | null = null;
    if (maxUses !== null && maxUses !== undefined && maxUses !== ("" as unknown)) {
      const parsedMaxUses = Number(maxUses);
      if (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1) {
        return NextResponse.json({ error: "Kullanım sınırı pozitif bir tam sayı olmalıdır." }, { status: 400 });
      }
      normalizedMaxUses = parsedMaxUses;
    }

    let normalizedExpiresAt: Date | null = null;
    if (expiresAt) {
      const parsedDate = new Date(expiresAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Geçersiz son kullanma tarihi." }, { status: 400 });
      }
      normalizedExpiresAt = parsedDate;
    }

    const discount = await prisma.discount.create({
      data: {
        code: normalizeDiscountCode(code),
        discountPercent: percent,
        maxUses: normalizedMaxUses,
        expiresAt: normalizedExpiresAt,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu kupon kodu zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Error creating discount:", error);
    return NextResponse.json({ error: "Kupon oluşturulamadı." }, { status: 500 });
  }
}
