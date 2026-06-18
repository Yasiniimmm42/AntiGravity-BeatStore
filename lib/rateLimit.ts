import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function isRateLimited(key: string): Promise<boolean> {
  const entry = await prisma.rateLimit.findUnique({ where: { key } });
  if (!entry || entry.resetAt <= new Date()) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(key: string): Promise<void> {
  const now = new Date();
  const entry = await prisma.rateLimit.findUnique({ where: { key } });

  if (!entry || entry.resetAt <= now) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now.getTime() + WINDOW_MS) },
      create: { key, count: 1, resetAt: new Date(now.getTime() + WINDOW_MS) },
    });
    return;
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}

export async function resetAttempts(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
