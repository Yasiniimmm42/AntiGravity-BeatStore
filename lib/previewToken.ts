import crypto from "crypto";

// Süreç başına bir kerelik secret: token'lar zaten ~60sn ömürlü olduğu için
// kalıcı bir env değişkenine gerek yok, aynı process içinde üretilip
// doğrulanmaları yeterli.
const SECRET = crypto.randomBytes(32);
const TOKEN_TTL_MS = 60 * 1000;

// Tek kullanımlık token takibi: imza -> son geçerlilik zamanı.
const usedTokens = new Map<string, number>();

function purgeExpired() {
  const now = Date.now();
  for (const [sig, expiresAt] of usedTokens) {
    if (expiresAt <= now) usedTokens.delete(sig);
  }
}

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createPreviewToken(filename: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${filename}|${expiresAt}`;
  const sig = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyAndConsumePreviewToken(filename: string, token: string): boolean {
  purgeExpired();

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
  const payloadFilename = payload.slice(0, separatorIndex);
  const expiresAtStr = payload.slice(separatorIndex + 1);

  if (payloadFilename !== filename) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  // Tek kullanımlık: aynı imza ikinci kez gelirse reddet.
  if (usedTokens.has(sig)) return false;
  usedTokens.set(sig, expiresAt);
  return true;
}
