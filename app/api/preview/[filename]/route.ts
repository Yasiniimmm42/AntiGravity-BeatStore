import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Path traversal koruması: yalnızca düz dosya adına izin ver.
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return NextResponse.json({ error: "Geçersiz dosya." }, { status: 400 });
  }

  // Beat.taggedAudioUrl yeni kayıtlarda bare filename, eski kayıtlarda /uploads/<filename> olarak tutulur.
  const beat = await prisma.beat.findFirst({
    where: { OR: [{ taggedAudioUrl: filename }, { taggedAudioUrl: `/uploads/${filename}` }] },
  });

  if (!beat) {
    return NextResponse.json({ error: "Önizleme bulunamadı." }, { status: 404 });
  }

  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }

  const privatePath = path.join(process.cwd(), "private", "previews", filename);
  const legacyPublicPath = path.join(process.cwd(), "public", "uploads", filename);

  let filepath = privatePath;
  let fileSize: number;
  try {
    fileSize = (await stat(privatePath)).size;
  } catch {
    try {
      fileSize = (await stat(legacyPublicPath)).size;
      filepath = legacyPublicPath;
    } catch {
      return NextResponse.json({ error: "Önizleme bulunamadı." }, { status: 404 });
    }
  }

  const range = req.headers.get("range");
  const baseHeaders = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Disposition": "inline",
  };

  if (range) {
    const match = range.match(/bytes=(\d*)-(\d*)/);
    const start = match && match[1] ? parseInt(match[1], 10) : 0;
    const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1;
    const safeStart = Math.max(0, Math.min(start, fileSize - 1));
    const safeEnd = Math.max(safeStart, Math.min(end, fileSize - 1));

    const buffer = await readFile(filepath);
    const chunk = buffer.subarray(safeStart, safeEnd + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${safeStart}-${safeEnd}/${fileSize}`,
        "Content-Length": String(chunk.length),
      },
    });
  }

  const buffer = await readFile(filepath);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(fileSize),
    },
  });
}
