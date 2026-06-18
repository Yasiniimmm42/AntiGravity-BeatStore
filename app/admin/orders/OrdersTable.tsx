"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
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

function formatDate(date: Date) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div>
      <h1 className="mb-7 text-[28px] font-bold tracking-tight text-zinc-50">Siparişler</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
          Henüz sipariş yok.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-5 py-3 font-medium text-zinc-400">Sipariş ID</th>
                <th className="px-5 py-3 font-medium text-zinc-400">Tarih</th>
                <th className="px-5 py-3 font-medium text-zinc-400">Müşteri</th>
                <th className="px-5 py-3 font-medium text-zinc-400">Toplam Tutar</th>
                <th className="px-5 py-3 font-medium text-zinc-400">Durum</th>
                <th className="px-5 py-3 font-medium text-zinc-400"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-zinc-200">#{order.orderNumber}</td>
                  <td className="px-5 py-3 text-zinc-300">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 text-zinc-300">{order.customerEmail}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-50">₺{order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      Detay <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-50">Sipariş #{selectedOrder.orderNumber}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedOrder.customerEmail} • {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-zinc-100">{item.title}</div>
                    <div className="text-xs text-zinc-400">{LICENSE_INFO[item.licenseType].label} Lisans</div>
                  </div>
                  <div className="font-semibold text-zinc-50">₺{item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="font-medium text-zinc-300">Toplam</span>
              <span className="text-lg font-bold text-zinc-50">₺{selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
