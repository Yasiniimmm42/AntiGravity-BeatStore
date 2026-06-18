import { prisma } from "@/lib/prisma";
import { OrdersTable } from "./OrdersTable";

// Sipariş listesi sürekli değişir; bu sayfa dinamik segment içermediği için
// Next.js aksi belirtilmezse build zamanında statik olarak donduracaktı —
// her istekte taze veri için zorunlu dinamik render.
export const dynamic = "force-dynamic";

// Server Component: admin paneli zaten proxy.ts ile korunduğu için,
// burada doğrudan Prisma sorgusu yapmak yeni bir public API route
// açmaktan daha güvenli ve daha hızlı (ekstra client-side fetch yok).
export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return <OrdersTable orders={orders} />;
}
