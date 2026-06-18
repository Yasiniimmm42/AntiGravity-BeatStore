"use client";

import Link from "next/link";
import { Wallet, ShoppingCart, CalendarDays, Receipt, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
  index,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="admin-card"
      style={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)' }}>
          {label}
        </span>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color="var(--foreground)" />
        </div>
      </div>
      <div style={{ marginTop: '14px', fontSize: '26px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)' }}>
        {value}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "paid";
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-hover)',
        border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
        color: isPaid ? '#10b981' : 'var(--muted)',
      }}
    >
      {isPaid ? "Tamamlandı" : status}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        padding: '10px 14px',
        fontSize: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ color: 'var(--muted)' }}>{label ? formatShortDate(label) : ""}</div>
      <div style={{ marginTop: '2px', fontWeight: 600, color: 'var(--foreground)' }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 20px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  verticalAlign: 'middle',
};

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Hesap Özeti</h1>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Toplam Ciro" value={formatCurrency(totalRevenue)} icon={Wallet} index={0} />
        <StatCard label="Toplam Sipariş" value={orderCount.toLocaleString("tr-TR")} icon={ShoppingCart} index={1} />
        <StatCard label="Bu Ayki Satışlar" value={formatCurrency(monthRevenue)} icon={CalendarDays} index={2} />
        <StatCard label="Ortalama Sipariş Değeri" value={formatCurrency(averageOrderValue)} icon={Receipt} index={3} />
      </div>

      {/* Line Chart */}
      <div className="admin-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          Son 30 Gün — Günlük Satış Hacmi
        </h2>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                interval={Math.ceil(chartData.length / 8)}
              />
              <YAxis
                tickFormatter={(v) => `₺${v}`}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
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
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>Son Siparişler</h2>
          <Link
            href="/admin/orders"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}
          >
            Tümünü Gör <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            Henüz sipariş yok.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '560px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Sipariş</th>
                  <th style={thStyle}>Müşteri</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Tutar</th>
                  <th style={thStyle}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: index === recentOrders.length - 1 ? 'none' : '1px solid var(--border)' }}
                  >
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: 'var(--foreground)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                        }}
                      >
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--foreground)' }}>{order.customerName || order.customerEmail}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
