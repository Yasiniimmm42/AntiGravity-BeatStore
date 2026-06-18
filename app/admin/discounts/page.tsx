import { prisma } from "@/lib/prisma";
import { DiscountsManager } from "./DiscountsManager";

// Kupon listesi sürekli değişir; dinamik route segmenti olmadığı için
// Next.js aksi belirtilmezse build zamanında statik donduracaktı.
export const dynamic = "force-dynamic";

export default async function AdminDiscounts() {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  return <DiscountsManager discounts={discounts} />;
}
