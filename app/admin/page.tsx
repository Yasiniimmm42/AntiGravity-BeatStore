"use client";

import { useEffect, useState } from "react";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LICENSE_INFO, LICENSE_ORDER } from "@/lib/licenses";

type LicenseType = "BASIC" | "PREMIUM" | "UNLIMITED";

type License = {
  id: number;
  type: LicenseType;
  price: number;
};

type Beat = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  coverUrl: string;
  licenses: License[];
};

function sortedLicenses(licenses: License[]) {
  return [...licenses].sort((a, b) => LICENSE_ORDER.indexOf(a.type) - LICENSE_ORDER.indexOf(b.type));
}

export default function AdminCatalog() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);

  const fetchBeats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/beats");
      const data = await res.json();
      setBeats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial catalog fetch on mount
    fetchBeats();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu beat'i tamamen silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/beats/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBeats();
      } else {
        const data = await res.json();
        alert(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBeat) return;
    try {
      const res = await fetch(`/api/beats/${editingBeat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingBeat.title,
          genre: editingBeat.genre,
          bpm: editingBeat.bpm,
          licenses: editingBeat.licenses.map(l => ({ type: l.type, price: l.price })),
        }),
      });
      if (res.ok) {
        setEditingBeat(null);
        fetchBeats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEditingLicensePrice = (type: LicenseType, price: number) => {
    if (!editingBeat) return;
    setEditingBeat({
      ...editingBeat,
      licenses: editingBeat.licenses.map(l => (l.type === type ? { ...l, price } : l)),
    });
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--muted)' }}>Katalog yükleniyor...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Katalog</h1>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {beats.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Henüz yüklenmiş bir beat yok.
          </div>
        )}

        {beats.map((beat, index) => {
          const basicPrice = beat.licenses.find(l => l.type === "BASIC")?.price ?? 0;
          return (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass"
              style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '20px' }}
            >
              {beat.coverUrl ? (
                <img src={beat.coverUrl} alt="Cover" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon color="var(--muted)" />
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>{beat.title}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>
                  {beat.genre} • {beat.bpm} BPM
                </p>
              </div>

              <div style={{ fontSize: '16px', fontWeight: '600', minWidth: '140px', textAlign: 'right', color: 'var(--foreground)' }}>
                Basic ₺{basicPrice.toFixed(2)}&apos;den başlıyor
              </div>

              <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingBeat(beat)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--foreground)' }}
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(beat.id)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingBeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ padding: '30px', width: '100%', maxWidth: '420px', border: '1px solid var(--border)', borderRadius: '16px' }}
            >
              <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>Özellikleri Düzenle</h2>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Başlık</label>
                  <input type="text" required value={editingBeat.title} onChange={e => setEditingBeat({...editingBeat, title: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Tarz</label>
                  <input type="text" required value={editingBeat.genre} onChange={e => setEditingBeat({...editingBeat, genre: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>BPM</label>
                  <input type="number" required value={editingBeat.bpm} onChange={e => setEditingBeat({...editingBeat, bpm: Number(e.target.value)})} />
                </div>

                <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                {sortedLicenses(editingBeat.licenses).map((lic) => (
                  <div key={lic.type}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                      {LICENSE_INFO[lic.type].label} Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={lic.price}
                      onChange={(e) => updateEditingLicensePrice(lic.type, Number(e.target.value))}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingBeat(null)} className="btn-outline" style={{ flex: 1 }}>İptal</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
