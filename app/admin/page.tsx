import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

// Metrikler her açılışta taze olmalı; dinamik route segmenti olmadığı için
// Next.js aksi belirtilmezse build zamanında statik donduracaktı.
export const dynamic = "force-dynamic";

const CHART_DAYS = 30;

export default async function AdminHome() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - (CHART_DAYS - 1));
  rangeStart.setHours(0, 0, 0, 0);

  const [totalAgg, orderCount, monthAgg, recentOrders, rangeOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "paid" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "paid", createdAt: { gte: startOfMonth } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { status: "paid", createdAt: { gte: rangeStart } },
      select: { total: true, createdAt: true },
    }),
  ]);

  // Son CHART_DAYS gün için sıfırla doldurulmuş günlük kovalar — sipariş
  // olmayan günler grafikte boşluk değil, düz bir çizgi olarak görünsün.
  const buckets: { date: string; total: number }[] = [];
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    buckets.push({ date: d.toISOString().slice(0, 10), total: 0 });
  }
  const bucketByDate = new Map(buckets.map((b) => [b.date, b]));
  for (const order of rangeOrders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    const bucket = bucketByDate.get(key);
    if (bucket) bucket.total += order.total;
  }

  const totalRevenue = totalAgg._sum.total ?? 0;
  const monthRevenue = monthAgg._sum.total ?? 0;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return (
    <DashboardClient
      totalRevenue={totalRevenue}
      orderCount={orderCount}
      monthRevenue={monthRevenue}
      averageOrderValue={averageOrderValue}
      chartData={buckets}
      recentOrders={recentOrders}
    />
  );
}
