"use client";

import { Wallet, ShoppingCart, CalendarDays, Receipt } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type OrderItem = {
  id: number;
  title: string;
  price: number;
};

type Order = {
  id: number;
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  total: number;
  status: string;
  createdAt: Date;
  items: OrderItem[];
};

type ChartPoint = { date: string; total: number };

function formatCurrency(value: number) {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
          <Icon size={16} className="text-zinc-300" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums text-zinc-50">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isPaid = status === "paid";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
        (isPaid
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-zinc-800 text-zinc-400 border border-zinc-700")
      }
    >
      {isPaid ? "Tamamlandı" : status}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-400">{label ? formatShortDate(label) : ""}</div>
      <div className="mt-0.5 font-semibold text-zinc-50">{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

export function DashboardClient({
  totalRevenue,
  orderCount,
  monthRevenue,
  averageOrderValue,
  chartData,
  recentOrders,
}: {
  totalRevenue: number;
  orderCount: number;
  monthRevenue: number;
  averageOrderValue: number;
  chartData: ChartPoint[];
  recentOrders: Order[];
}) {
  return (
    <div>
      <h1 className="mb-7 text-[28px] font-bold tracking-tight text-zinc-50">Hesap Özeti</h1>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Ciro" value={formatCurrency(totalRevenue)} icon={Wallet} />
        <StatCard label="Toplam Sipariş" value={orderCount.toLocaleString("tr-TR")} icon={ShoppingCart} />
        <StatCard label="Bu Ayki Satışlar" value={formatCurrency(monthRevenue)} icon={CalendarDays} />
        <StatCard label="Ortalama Sipariş Değeri" value={formatCurrency(averageOrderValue)} icon={Receipt} />
      </div>

      {/* Line Chart */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">Son 30 Gün — Günlük Satış Hacmi</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                interval={Math.ceil(chartData.length / 8)}
              />
              <YAxis
                tickFormatter={(v) => `₺${v}`}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#fafafa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#fafafa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-300">Son Siparişler</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Henüz sipariş yok.</div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Sipariş</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Müşteri</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Tutar</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-zinc-300">#{order.orderNumber}</td>
                  <td className="px-5 py-3 text-zinc-300">
                    {order.customerName || order.customerEmail}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums text-zinc-50">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <StatusPill status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
