import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedRequest } from "@/lib/auth";

const REQUIRED_LICENSE_TYPES = ["BASIC", "PREMIUM", "UNLIMITED"];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    // fileUrl kasıtlı olarak döndürülmüyor: bu route kimlik doğrulaması
    // olmadan herkese açık, satın alınmamış dosyaların indirme linkini
    // sızdırmamak için sadece tür/fiyat bilgisi veriliyor.
    const beats = await prisma.beat.findMany({
      orderBy: { createdAt: "desc" },
      include: { licenses: { select: { id: true, type: true, price: true } } },
    });
    return NextResponse.json(beats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, genre, bpm, taggedAudioUrl, coverUrl, licenses } = data;

    if (!Array.isArray(licenses) || licenses.length !== 3) {
      return NextResponse.json(
        { error: "Tam olarak 3 lisans (Basic, Premium, Unlimited) gereklidir." },
        { status: 400 }
      );
    }

    const providedTypes = licenses.map((l) => l.type);
    const missing = REQUIRED_LICENSE_TYPES.filter((t) => !providedTypes.includes(t));
    if (missing.length > 0) {
      return NextResponse.json({ error: `Eksik lisans türleri: ${missing.join(", ")}` }, { status: 400 });
    }

    for (const lic of licenses) {
      if (typeof lic.price !== "number" || lic.price < 0 || !lic.fileUrl) {
        return NextResponse.json(
          { error: "Her lisans için geçerli fiyat ve dosya URL'si gereklidir." },
          { status: 400 }
        );
      }
    }

    let slug = generateSlug(title);
    let existing = await prisma.beat.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${generateSlug(title)}-${counter}`;
      existing = await prisma.beat.findUnique({ where: { slug } });
      counter++;
    }

    const beat = await prisma.beat.create({
      data: {
        title,
        genre,
        bpm: Number(bpm),
        slug,
        taggedAudioUrl: taggedAudioUrl || null,
        coverUrl: coverUrl || null,
        licenses: {
          create: licenses.map((l) => ({ type: l.type, price: l.price, fileUrl: l.fileUrl })),
        },
      },
      include: { licenses: true },
    });

    return NextResponse.json(beat, { status: 201 });
  } catch (error) {
    console.error("Error creating beat:", error);
    return NextResponse.json({ error: "Failed to create beat" }, { status: 500 });
  }
}
