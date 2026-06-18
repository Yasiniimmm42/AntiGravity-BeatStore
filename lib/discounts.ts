import type { Discount } from "@prisma/client";

export function checkDiscountValidity(
  discount: Discount | null,
  now: Date = new Date()
): { valid: true } | { valid: false; error: string } {
  if (!discount) return { valid: false, error: "Kupon kodu bulunamadı." };
  if (!discount.isActive) return { valid: false, error: "Bu kupon artık aktif değil." };
  if (discount.expiresAt && discount.expiresAt < now) return { valid: false, error: "Kuponun süresi dolmuş." };
  if (discount.maxUses !== null && discount.uses >= discount.maxUses) {
    return { valid: false, error: "Kupon kullanım sınırına ulaşmış." };
  }
  return { valid: true };
}

export function normalizeDiscountCode(code: string): string {
  return code.trim().toUpperCase();
}
