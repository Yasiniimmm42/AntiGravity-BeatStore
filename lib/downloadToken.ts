import crypto from "crypto";

// Token üretimi (sipariş sayfası) ve doğrulaması (indirme route'u) farklı
// route modüllerinde çalışıyor; rastgele bir bellek-içi secret bu modüller
// arasında (özellikle dev modunda Turbopack'in route başına izolasyonunda)
// tutarsız kalabilir. Bu yüzden ADMIN_PASSWORD'den türetilmiş, sabit bir
// secret kullanıyoruz (lib/auth.ts'teki getSessionToken ile aynı desen).
const SECRET = crypto.createHash("sha256").update(`${process.env.ADMIN_PASSWORD}:download`).digest();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createDownloadToken(orderItemId: number): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${orderItemId}|${expiresAt}`;
  const sig = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyDownloadToken(orderItemId: number, token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, sig] = parts;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const separatorIndex = payload.lastIndexOf("|");
  if (separatorIndex === -1) return false;
  const payloadItemId = payload.slice(0, separatorIndex);
  const expiresAtStr = payload.slice(separatorIndex + 1);

  if (Number(payloadItemId) !== orderItemId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  return true;
}
