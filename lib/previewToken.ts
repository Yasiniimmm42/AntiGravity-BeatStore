import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 1000;

// Süresi dolmuş veya tüketilmiş token satırlarının veritabanını şişirmesini
// önlemek için ufak bir temizlik sorgusu; çağıran route'u bloklamadan
// (await edilmeden) tetiklenir, hata olursa sessizce loglanır.
function cleanupExpiredTokens() {
  prisma.previewToken
    .deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
      },
    })
    .catch((err) => console.error("Önizleme token temizliği başarısız", err));
}

export async function createPreviewToken(filename: string): Promise<string> {
  cleanupExpiredTokens();

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.previewToken.create({
    data: { token, filename, expiresAt },
  });

  return token;
}

// Tek kullanımlık tüketim: updateMany'nin where koşulu (isUsed: false) ile
// aynı anda gelen iki istek arasında race condition oluşmadan token sadece
// bir kez "isUsed=true" olarak işaretlenebilir.
export async function verifyAndConsumePreviewToken(filename: string, token: string): Promise<boolean> {
  cleanupExpiredTokens();

  const result = await prisma.previewToken.updateMany({
    where: {
      token,
      filename,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    data: { isUsed: true },
  });

  return result.count === 1;
}
