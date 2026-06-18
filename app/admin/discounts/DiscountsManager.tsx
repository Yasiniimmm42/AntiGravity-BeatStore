"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Tag, CalendarDays, Edit2, Trash2 } from "lucide-react";

type Discount = {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  uses: number;
  maxUses: number | null;
  expiresAt: Date | null;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function getStatus(discount: Discount): { label: string; tone: "active" | "muted" } {
  if (!discount.isActive) return { label: "Pasif", tone: "muted" };
  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) return { label: "Süresi Doldu", tone: "muted" };
  if (discount.maxUses !== null && discount.uses >= discount.maxUses) return { label: "Limit Doldu", tone: "muted" };
  return { label: "Aktif", tone: "active" };
}

function StatusBadge({ discount }: { discount: Discount }) {
  const { label, tone } = getStatus(discount);
  const isActive = tone === "active";
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-hover)',
        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
        color: isActive ? '#10b981' : 'var(--muted)',
      }}
    >
      {label}
    </span>
  );
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

type FormState = {
  code: string;
  discountPercent: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = { code: "", discountPercent: "", maxUses: "", expiresAt: "", isActive: true };

export function DiscountsManager({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isFormOpen = showCreateForm || editingDiscount !== null;

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setError("");
    setShowCreateForm(true);
  };

  const openEditForm = (discount: Discount) => {
    setForm({
      code: discount.code,
      discountPercent: String(discount.discountPercent),
      maxUses: discount.maxUses !== null ? String(discount.maxUses) : "",
      expiresAt: toDateInputValue(discount.expiresAt),
      isActive: discount.isActive,
    });
    setError("");
    setEditingDiscount(discount);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingDiscount(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      code: form.code,
      discountPercent: Number(form.discountPercent),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      ...(editingDiscount ? { isActive: form.isActive } : {}),
    };

    try {
      const res = await fetch(editingDiscount ? `/api/discounts/${editingDiscount.id}` : "/api/discounts", {
        method: editingDiscount ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kupon kaydedilemedi.");

      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (discount: Discount) => {
    if (!confirm(`"${discount.code}" kuponunu kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setDeletingId(discount.id);
    try {
      const res = await fetch(`/api/discounts/${discount.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Kupon silinemedi.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>İndirimler</h1>
        <button onClick={openCreateForm} className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>
          <Plus size={16} /> Yeni Kupon Oluştur
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          Henüz kupon oluşturulmadı.
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Kod</th>
                  <th style={thStyle}>İndirim</th>
                  <th style={thStyle}>Kullanım</th>
                  <th style={thStyle}>Son Kullanma</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount, index) => (
                  <tr
                    key={discount.id}
                    style={{ borderBottom: index === discounts.length - 1 ? 'none' : '1px solid var(--border)' }}
                  >
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--foreground)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                        }}
                      >
                        <Tag size={12} /> {discount.code}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--foreground)' }}>%{discount.discountPercent}</td>
                    <td style={{ ...tdStyle, color: 'var(--muted)' }}>
                      {discount.uses} / {discount.maxUses ?? "∞"}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--muted)' }}>
                      {discount.expiresAt ? formatDate(discount.expiresAt) : "Süresiz"}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge discount={discount} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditForm(discount)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--foreground)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(discount)}
                          disabled={deletingId === discount.id}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card"
              style={{ padding: '30px', width: '100%', maxWidth: '420px' }}
            >
              <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
                {editingDiscount ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}
              </h2>

              {error && (
                <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                    Kupon Kodu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: MAHSHER20"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                    İndirim Yüzdesi (1-100)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    placeholder="20"
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                    Kullanım Sınırı (opsiyonel)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Sınırsız"
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                    Son Kullanma Tarihi (opsiyonel)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CalendarDays
                      size={16}
                      color="var(--muted)"
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                    {form.expiresAt
                      ? `Bu kupon ${new Date(form.expiresAt).toLocaleDateString("tr-TR")} sonrası kullanılamaz.`
                      : "Boş bırakılırsa kupon süresiz olur."}
                  </p>
                </div>

                {editingDiscount && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Kupon aktif
                  </label>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={closeForm} className="btn-outline" style={{ flex: 1 }}>
                    İptal
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                    {loading ? "Kaydediliyor..." : editingDiscount ? "Kaydet" : "Oluştur"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
