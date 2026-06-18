import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPreviewToken } from "@/lib/previewToken";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return NextResponse.json({ error: "Geçersiz dosya." }, { status: 400 });
  }

  // Token sadece gerçekten bir beat'in tagged önizlemesine ait dosya adları için verilir.
  const beat = await prisma.beat.findFirst({
    where: { OR: [{ taggedAudioUrl: filename }, { taggedAudioUrl: `/uploads/${filename}` }] },
  });

  if (!beat) {
    return NextResponse.json({ error: "Önizleme bulunamadı." }, { status: 404 });
  }

  const token = createPreviewToken(filename);
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
