import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { isAuthorizedRequest } from "@/lib/auth";

const ARCHIVE_EXTENSIONS = [".zip", ".rar", ".7z", ".tar", ".gz", ".tar.gz"];

const ARCHIVE_MIME_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
  "application/x-rar",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  "application/x-gzip",
]);

const MP3_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/mpeg3", "audio/x-mpeg-3"]);
const WAV_MIME_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/x-pn-wav",
]);

const ALLOWED_MIME_TYPES = new Set([
  ...MP3_MIME_TYPES,
  ...WAV_MIME_TYPES,
  "image/png",
  "image/jpeg",
  "image/webp",
  ...ARCHIVE_MIME_TYPES,
]);

const PREVIEW_MIME_TYPES = new Set([...MP3_MIME_TYPES, ...WAV_MIME_TYPES]);
const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
// Tarayıcılar bazı MP3/WAV dosyalarını uzantıdan çıkaramayıp boş ya da
// application/octet-stream olarak rapor edebilir; bu durumda uzantıya bakıyoruz.
const AUDIO_FALLBACK_EXTENSIONS = [".mp3", ".wav"];

// Dosya türüne göre gerçekçi limitler: WAV sıkıştırılmamış olduğu için tek bir
// parça bile kolayca 25MB'ı geçer; stems/trackout paketleri (çok kanallı WAV arşivi)
// bundan da büyük olur. Kapak görseli ve MP3 küçük kalır.
const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MP3 = 30 * 1024 * 1024; // 30MB
const MAX_FILE_SIZE_WAV = 150 * 1024 * 1024; // 150MB
const MAX_FILE_SIZE_ARCHIVE = 500 * 1024 * 1024; // 500MB (stems/trackout paketleri)
// Önizleme sesi istemci tarafında fetch+blob ile tamamen RAM'e indirilip
// oynatıldığı için (bkz. components/AudioPlayer.tsx), büyük dosyalar hem
// tarayıcı belleğini hem sunucu bandwidth'ini şişirir. 128kbps MP3'te ~3
// dakikalık bir önizleme bu sınırın içinde kalır.
const MAX_FILE_SIZE_PREVIEW = 3 * 1024 * 1024; // 3MB

export async function POST(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const kind = formData.get("kind") as string | null;
    const isPreview = kind === "preview";

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isUnknownMime = file.type === "" || file.type === "application/octet-stream";
    const isArchiveByExt = ARCHIVE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const isAudioByExt = AUDIO_FALLBACK_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    // Arşiv MIME türleri tarayıcı/işletim sistemine göre çok değişken raporlanıyor
    // (application/x-compressed, application/x-rar-compressed, octet-stream, vb.) —
    // bu yüzden arşiv dosyalarında uzantıya güveniyoruz, MIME'a bakmıyoruz.
    const isArchiveFallback = isArchiveByExt;
    const isAudioFallback = isAudioByExt && isUnknownMime;

    if (isPreview && !PREVIEW_MIME_TYPES.has(file.type) && !isAudioFallback) {
      return NextResponse.json(
        { error: `Önizleme dosyası ses dosyası (MP3/WAV) olmalıdır: "${file.name}" (algılanan tür: ${file.type || "bilinmiyor"}).` },
        { status: 400 }
      );
    }

    const isAllowedType = ALLOWED_MIME_TYPES.has(file.type);

    if (!isPreview && !isAllowedType && !isArchiveFallback) {
      return NextResponse.json(
        { error: `Desteklenmeyen dosya türü: "${file.name}" (algılanan tür: ${file.type || "bilinmiyor"}).` },
        { status: 400 }
      );
    }

    const isArchive = isArchiveByExt || ARCHIVE_MIME_TYPES.has(file.type);
    const isWav = WAV_MIME_TYPES.has(file.type) || (isAudioFallback && lowerName.endsWith(".wav"));
    const isImage = IMAGE_MIME_TYPES.has(file.type);

    let maxSize: number;
    let maxLabel: string;
    if (isPreview) {
      maxSize = MAX_FILE_SIZE_PREVIEW;
      maxLabel = "3MB";
    } else if (isArchive) {
      maxSize = MAX_FILE_SIZE_ARCHIVE;
      maxLabel = "500MB";
    } else if (isWav) {
      maxSize = MAX_FILE_SIZE_WAV;
      maxLabel = "150MB";
    } else if (isImage) {
      maxSize = MAX_FILE_SIZE_IMAGE;
      maxLabel = "10MB";
    } else {
      maxSize = MAX_FILE_SIZE_MP3;
      maxLabel = "30MB";
    }

    if (file.size > maxSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      if (isPreview) {
        return NextResponse.json(
          {
            error: `Önizleme sesi dosyası çok büyük (${sizeMb}MB, maks. 3MB). Lütfen dosyayı 128kbps MP3 olarak sıkıştırıp tekrar yükleyin: "${file.name}".`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: `Dosya boyutu çok büyük (maks. ${maxLabel}).` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const filename = `${Date.now()}_${randomUUID()}${extension}`;

    if (isPreview) {
      const filepath = path.join(process.cwd(), "private", "previews", filename);
      await writeFile(filepath, buffer);
      // Önizleme dosyaları public/ altında değil, sadece bare filename döner —
      // /api/preview/[filename] route'u bunu private/previews/ içinde arar.
      return NextResponse.json({ url: filename });
    }

    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
