"use client";

import { useState } from "react";
import { UploadCloud, FileAudio, Image as ImageIcon, Music } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [price, setPrice] = useState("");
  const [taggedAudio, setTaggedAudio] = useState<File | null>(null);
  const [untaggedAudio, setUntaggedAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!untaggedAudio) throw new Error("Untagged ses dosyası (ana ürün) zorunludur.");

      let taggedAudioUrl = null;
      let coverUrl = null;

      if (taggedAudio) taggedAudioUrl = await uploadFile(taggedAudio);
      const untaggedAudioUrl = await uploadFile(untaggedAudio);
      if (cover) coverUrl = await uploadFile(cover);

      const beatData = {
        title,
        genre,
        bpm: parseInt(bpm),
        price: parseFloat(price),
        taggedAudioUrl,
        untaggedAudioUrl,
        coverUrl,
      };

      const res = await fetch("/api/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beatData),
      });

      if (!res.ok) throw new Error("Veritabanına kaydedilirken hata oluştu.");

      setMessage("Beat başarıyla yüklendi ve kataloğa eklendi!");
      setTitle(""); setGenre(""); setBpm(""); setPrice("");
      setTaggedAudio(null); setUntaggedAudio(null); setCover(null);
    } catch (error: any) {
      setMessage(error.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadCloud size={20} color="var(--primary)" />
        </div>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>Yeni Beat Yükle</h2>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '16px', marginBottom: '24px', background: message.includes('başarıyla') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${message.includes('başarıyla') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, color: message.includes('başarıyla') ? '#10b981' : '#ef4444', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Proje Başlığı</label>
            <input type="text" required placeholder="Örn: Dark Trap Beat" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Tarz (Genre)</label>
            <input type="text" required placeholder="Örn: Boom Bap" value={genre} onChange={e => setGenre(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>BPM (Tempo)</label>
            <input type="number" required placeholder="140" value={bpm} onChange={e => setBpm(e.target.value)} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Satış Fiyatı (TL)</label>
            <input type="number" step="0.01" required placeholder="500" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '10px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            <ImageIcon size={14} /> Kapak Görseli (Opsiyonel)
          </label>
          <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            <FileAudio size={14} /> Tagged Ses Dosyası (Sitede dinletmek için)
          </label>
          <input type="file" accept="audio/*" onChange={e => setTaggedAudio(e.target.files?.[0] || null)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
            <Music size={14} /> Untagged Ses Dosyası (Satın alanlara gönderilecek asıl dosya - Zorunlu)
          </label>
          <input type="file" accept="audio/*" required onChange={e => setUntaggedAudio(e.target.files?.[0] || null)} />
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="btn-primary" 
          disabled={loading} 
          style={{ marginTop: '10px', padding: '16px', fontSize: '15px', width: '100%' }}
        >
          {loading ? "Sisteme Yükleniyor..." : "Beat'i Yayınla"}
        </motion.button>
      </form>
    </motion.div>
  );
}
