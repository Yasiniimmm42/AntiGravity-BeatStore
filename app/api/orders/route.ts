import { NextRequest, NextResponse } from "next/server";
import { LicenseType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

type CheckoutItem = {
  beatId: number;
  licenseType: LicenseType;
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email, name, items } = data as { email: string; name?: string; items: CheckoutItem[] };

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

    const total = licenses.reduce((sum, lic) => sum + lic.price, 0);
    const orderNumber = randomUUID().slice(0, 8).toUpperCase();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: email,
        customerName: name || null,
        total,
        status: "paid",
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
