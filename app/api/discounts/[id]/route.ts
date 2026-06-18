import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedRequest } from "@/lib/auth";
import { normalizeDiscountCode } from "@/lib/discounts";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { code, discountPercent, isActive, maxUses, expiresAt } = data as {
      code?: string;
      discountPercent?: number;
      isActive?: boolean;
      maxUses?: number | null;
      expiresAt?: string | null;
    };

    const update: Prisma.DiscountUpdateInput = {};

    if (code !== undefined) {
      if (!code.trim()) {
        return NextResponse.json({ error: "Kupon kodu zorunludur." }, { status: 400 });
      }
      update.code = normalizeDiscountCode(code);
    }

    if (discountPercent !== undefined) {
      const percent = Number(discountPercent);
      if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
        return NextResponse.json({ error: "İndirim yüzdesi 1-100 arasında bir tam sayı olmalıdır." }, { status: 400 });
      }
      update.discountPercent = percent;
    }

    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    if (maxUses !== undefined) {
      if (maxUses === null) {
        update.maxUses = null;
      } else {
        const parsedMaxUses = Number(maxUses);
        if (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1) {
          return NextResponse.json({ error: "Kullanım sınırı pozitif bir tam sayı olmalıdır." }, { status: 400 });
        }
        update.maxUses = parsedMaxUses;
      }
    }

    if (expiresAt !== undefined) {
      if (!expiresAt) {
        update.expiresAt = null;
      } else {
        const parsedDate = new Date(expiresAt);
        if (Number.isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: "Geçersiz son kullanma tarihi." }, { status: 400 });
        }
        update.expiresAt = parsedDate;
      }
    }

    const discount = await prisma.discount.update({ where: { id }, data: update });
    return NextResponse.json(discount);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu kupon kodu zaten kullanılıyor." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    }
    console.error("Error updating discount:", error);
    return NextResponse.json({ error: "Kupon güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.discount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    }
    console.error("Error deleting discount:", error);
    return NextResponse.json({ error: "Kupon silinemedi." }, { status: 500 });
  }
}
