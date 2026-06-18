"use client";

import { useState } from "react";
import { useCart, cartKey } from "./CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { LICENSE_INFO } from "@/lib/licenses";

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, total, discount, discountedTotal, applyDiscount, removeDiscount } = useCart();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setApplying(true);
    setCouponError("");
    const result = await applyDiscount(code);
    if (!result.success) {
      setCouponError(result.error || "Kupon geçersiz.");
    } else {
      setCode("");
    }
    setApplying(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              right: 0, 
              bottom: 0, 
              width: '100%', 
              maxWidth: '400px', 
              background: 'var(--background)', 
              zIndex: 1001,
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={20} /> Sepetiniz
              </h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '40px' }}>
                  <ShoppingBag size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>Sepetiniz şu an boş.</p>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={cartKey(item.beatId, item.licenseType)}
                    style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  >
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--surface-hover)' }} />
                    )}

                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{item.title}</h4>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>{LICENSE_INFO[item.licenseType].label} Lisans</p>
                      <div style={{ marginTop: '8px', fontWeight: 600 }}>₺{item.price.toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => removeFromCart(cartKey(item.beatId, item.licenseType))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '8px', alignSelf: 'flex-start' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div style={{ marginBottom: '16px' }}>
                {discount ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} /> {discount.code} (%{discount.percent} indirim)
                    </span>
                    <button
                      onClick={removeDiscount}
                      style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Kupon kodu"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{ flex: 1, textTransform: 'uppercase' }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applying}
                      className="btn-outline"
                      style={{ padding: '0 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                    >
                      {applying ? "..." : "Uygula"}
                    </button>
                  </div>
                )}
                {couponError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{couponError}</p>}
              </div>

              {discount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>Ara Toplam</span>
                  <span style={{ textDecoration: 'line-through' }}>₺{total.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                <span>Toplam:</span>
                <span>₺{discountedTotal.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={items.length === 0 ? (e) => e.preventDefault() : onClose}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'block', textAlign: 'center', opacity: items.length === 0 ? 0.5 : 1, pointerEvents: items.length === 0 ? 'none' : 'auto' }}
              >
                Ödemeye Geç
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
