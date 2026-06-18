import { NextRequest, NextResponse } from "next/server";
import { LicenseType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { checkDiscountValidity, normalizeDiscountCode } from "@/lib/discounts";

type CheckoutItem = {
  beatId: number;
  licenseType: LicenseType;
};

class DiscountError extends Error {}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email, name, items, discountCode } = data as {
      email: string;
      name?: string;
      items: CheckoutItem[];
      discountCode?: string;
    };

    if (!email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "E-posta ve sepet bilgisi zorunludur." }, { status: 400 });
    }

    const licenses = await prisma.license.findMany({
      where: {
        OR: items.map((i) => ({ beatId: Number(i.beatId), type: i.licenseType })),
      },
      include: { beat: true },
    });

    if (licenses.length !== items.length) {
      return NextResponse.json({ error: "Sepetteki ürünler bulunamadı." }, { status: 400 });
    }

    const subtotal = licenses.reduce((sum, lic) => sum + lic.price, 0);
    const orderNumber = randomUUID().slice(0, 8).toUpperCase();

    const order = await prisma.$transaction(async (tx) => {
      let total = subtotal;
      let appliedCode: string | null = null;

      // Kupon sunucu tarafında baştan doğrulanır — istemcinin gönderdiği
      // indirim yüzdesine asla güvenilmez. Kullanım sayacı, maxUses'a karşı
      // koşullu bir updateMany ile atomik olarak artırılır (önizleme
      // token'larındaki tek-kullanımlık tüketim mantığıyla aynı desen) —
      // bu, eşzamanlı isteklerin kullanım sınırını aşmasını engeller.
      if (discountCode && discountCode.trim()) {
        const normalizedCode = normalizeDiscountCode(discountCode);
        const discount = await tx.discount.findUnique({ where: { code: normalizedCode } });
        const validity = checkDiscountValidity(discount);

        if (!validity.valid) {
          throw new DiscountError(validity.error);
        }

        const claim = await tx.discount.updateMany({
          where: {
            id: discount!.id,
            isActive: true,
            ...(discount!.maxUses !== null ? { uses: { lt: discount!.maxUses } } : {}),
          },
          data: { uses: { increment: 1 } },
        });

        if (claim.count !== 1) {
          throw new DiscountError("Kupon kullanım sınırına ulaşmış.");
        }

        total = Math.round(subtotal * (1 - discount!.discountPercent / 100) * 100) / 100;
        appliedCode = normalizedCode;
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerEmail: email,
          customerName: name || null,
          total,
          status: "paid",
          discountCode: appliedCode,
          items: {
            create: licenses.map((lic) => ({
              beatId: lic.beatId,
              licenseType: lic.type,
              title: lic.beat.title,
              price: lic.price,
              downloadUrl: lic.fileUrl,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof DiscountError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
