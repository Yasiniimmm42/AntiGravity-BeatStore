"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartKey } from "@/components/CartProvider";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { LICENSE_INFO } from "@/lib/licenses";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, items: items.map((i) => ({ beatId: i.beatId, licenseType: i.licenseType })) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş oluşturulamadı.");

      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--muted)", marginBottom: "20px" }}>Sepetiniz boş.</p>
        <Link href="/" className="btn-primary" style={{ padding: "12px 24px", display: "inline-block" }}>
          Beatlere Göz At
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "60px", paddingLeft: "20px", paddingRight: "20px", paddingBottom: "120px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>Ödeme</h1>

        <div className="glass-panel" style={{ padding: "24px", border: "1px solid var(--border)", marginBottom: "24px" }}>
          {items.map((item) => (
            <div key={cartKey(item.beatId, item.licenseType)} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div>{item.title}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>{LICENSE_INFO[item.licenseType].label} Lisans</div>
              </div>
              <span>₺{item.price.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", fontWeight: 700, fontSize: "18px" }}>
            <span>Toplam</span>
            <span>₺{total.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px", marginBottom: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", borderRadius: "8px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ padding: "24px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>E-posta</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>Ad Soyad (opsiyonel)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <p style={{ fontSize: "12px", color: "var(--muted)" }}>
            Bu demo sürümde gerçek bir ödeme alınmaz; gönderdiğinizde sipariş doğrudan tamamlanır.
          </p>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <CreditCard size={18} />
            {loading ? "İşleniyor..." : `₺${total.toFixed(2)} Öde (Demo)`}
          </button>
        </motion.form>
      </div>
    </main>
  );
}
