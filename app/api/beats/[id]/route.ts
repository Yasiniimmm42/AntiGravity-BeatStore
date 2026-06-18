import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAuthorizedRequest } from '@/lib/auth';

const VALID_LICENSE_TYPES = ["BASIC", "PREMIUM", "UNLIMITED"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const beatId = Number(id);
    const data = await req.json();
    const { title, genre, bpm, licenses } = data;

    if (Array.isArray(licenses)) {
      for (const lic of licenses) {
        if (!VALID_LICENSE_TYPES.includes(lic.type) || typeof lic.price !== "number" || lic.price < 0) {
          return NextResponse.json(
            { error: `Geçersiz lisans türü veya fiyatı: ${lic.type}` },
            { status: 400 }
          );
        }
      }
    }

    const updatedBeat = await prisma.$transaction(async (tx) => {
      await tx.beat.update({
        where: { id: beatId },
        data: { title, genre, bpm: Number(bpm) },
      });

      if (Array.isArray(licenses)) {
        for (const lic of licenses) {
          await tx.license.upsert({
            where: { beatId_type: { beatId, type: lic.type } },
            update: { price: Number(lic.price) },
            create: { beatId, type: lic.type, price: Number(lic.price), fileUrl: lic.fileUrl ?? "" },
          });
        }
      }

      return tx.beat.findUnique({ where: { id: beatId }, include: { licenses: true } });
    });

    return NextResponse.json(updatedBeat);
  } catch (error) {
    console.error("Error updating beat:", error);
    return NextResponse.json({ error: "Failed to update beat" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.beat.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Bu beat daha önce satın alınmış, sipariş geçmişi olduğu için silinemez." },
        { status: 409 }
      );
    }
    console.error("Error deleting beat:", error);
    return NextResponse.json({ error: "Failed to delete beat" }, { status: 500 });
  }
}
