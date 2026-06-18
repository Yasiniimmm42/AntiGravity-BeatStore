import crypto from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD ortam değişkeni tanımlı değil.");
  }
  return password;
}

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getSessionToken() {
  return crypto.createHash("sha256").update(getAdminPassword()).digest("hex");
}

export function verifyPassword(password: string) {
  return safeCompare(
    crypto.createHash("sha256").update(password).digest("hex"),
    getSessionToken()
  );
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  return safeCompare(token, getSessionToken());
}

export function isAuthorizedRequest(req: NextRequest) {
  return verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
