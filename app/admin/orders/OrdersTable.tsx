"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LICENSE_INFO } from "@/lib/licenses";

type LicenseType = "BASIC" | "PREMIUM" | "UNLIMITED";

type OrderItem = {
  id: number;
  beatId: number;
  licenseType: LicenseType;
  title: string;
  price: number;
  downloadUrl: string;
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

function formatDate(date: Date) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 20px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  verticalAlign: 'middle',
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Siparişler</h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--muted)', fontSize: '14px' }}>
          {orders.length} sipariş · ₺{totalRevenue.toFixed(2)} toplam ciro
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          Henüz sipariş yok.
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Sipariş ID</th>
                  <th style={thStyle}>Tarih</th>
                  <th style={thStyle}>Müşteri</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Toplam Tutar</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      borderBottom: index === orders.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
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
                    <td style={{ ...tdStyle, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(order.createdAt)}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                        {order.customerName || <span style={{ color: 'var(--muted)' }}>İsim belirtilmemiş</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      ₺{order.total.toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-outline"
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                      >
                        Detay <ChevronRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card"
              style={{ padding: '30px', width: '100%', maxWidth: '460px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Sipariş</h2>
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
                      #{selectedOrder.orderNumber}
                    </span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    {selectedOrder.customerName ? `${selectedOrder.customerName} • ` : ""}
                    {selectedOrder.customerEmail}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {LICENSE_INFO[item.licenseType].label} Lisans
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>₺{item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Toplam</span>
                <span style={{ fontSize: '20px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ₺{selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
