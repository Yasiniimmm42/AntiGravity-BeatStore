import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyDownloadToken } from "@/lib/downloadToken";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string; itemId: string }> }
) {
  const { orderNumber, itemId } = await params;
  const itemIdNum = Number(itemId);

  if (!orderNumber || !Number.isInteger(itemIdNum)) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token || !verifyDownloadToken(itemIdNum, token)) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş indirme bağlantısı." }, { status: 403 });
  }

  // Sipariş kalemi gerçekten bu sipariş numarasına ait olmalı — token tek
  // başına itemId'ye bağlı olduğu için, orderNumber eşleşmesi linkin
  // doğru sipariş bağlamından geldiğini doğrular.
  const item = await prisma.orderItem.findUnique({
    where: { id: itemIdNum },
    include: { order: true },
  });

  if (!item || item.order.orderNumber !== orderNumber) {
    return NextResponse.json({ error: "Sipariş kalemi bulunamadı." }, { status: 404 });
  }

  // downloadUrl yeni satın alımlarda bare filename, eski kayıtlarda
  // /uploads/<filename> olarak tutulur.
  const filename = item.downloadUrl.replace(/^\/uploads\//, "");
  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

  const privatePath = path.join(process.cwd(), "private", "licenses", filename);
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
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
    }
  }

  const buffer = await readFile(filepath);
  const friendlyName = `${item.title} - ${item.licenseType}${extension}`.replace(/[\\/:*?"<>|]/g, "_");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Content-Disposition": `attachment; filename="${friendlyName}"`,
      "Cache-Control": "no-store",
    },
  });
}
