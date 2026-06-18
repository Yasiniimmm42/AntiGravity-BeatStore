"use client";

import { useState } from "react";
import { UploadCloud, FileAudio, Image as ImageIcon, Music, Archive } from "lucide-react";
import { motion } from "framer-motion";

type LicenseType = "BASIC" | "PREMIUM" | "UNLIMITED";

type LicenseFormState = {
  price: string;
  file: File | null;
};

const LICENSE_TIERS: { type: LicenseType; label: string; hint: string; accept: string }[] = [
  { type: "BASIC", label: "Basic (MP3)", hint: "MP3 dosyası", accept: "audio/mpeg" },
  { type: "PREMIUM", label: "Premium (WAV)", hint: "WAV dosyası", accept: "audio/wav,audio/x-wav" },
  { type: "UNLIMITED", label: "Unlimited (Stems/Trackout)", hint: "Arşiv dosyası (ZIP/RAR/7Z/TAR/GZ)", accept: ".zip,.rar,.7z,.tar,.gz" },
];

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [taggedAudio, setTaggedAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [licenses, setLicenses] = useState<Record<LicenseType, LicenseFormState>>({
    BASIC: { price: "", file: null },
    PREMIUM: { price: "", file: null },
    UNLIMITED: { price: "", file: null },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const setLicensePrice = (type: LicenseType, price: string) => {
    setLicenses((prev) => ({ ...prev, [type]: { ...prev[type], price } }));
  };

  const setLicenseFile = (type: LicenseType, file: File | null) => {
    setLicenses((prev) => ({ ...prev, [type]: { ...prev[type], file } }));
  };

  const uploadFile = async (file: File, label: string, kind?: "preview" | "license") => {
    const formData = new FormData();
    formData.append("file", file);
    if (kind) formData.append("kind", kind);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${label}: ${data.error}`);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      for (const tier of LICENSE_TIERS) {
        const lic = licenses[tier.type];
        if (!lic.file) throw new Error(`${tier.label} için dosya zorunludur.`);
        if (!lic.price) throw new Error(`${tier.label} için fiyat zorunludur.`);
      }

      let taggedAudioUrl = null;
      let coverUrl = null;

      if (taggedAudio) taggedAudioUrl = await uploadFile(taggedAudio, "Tagged Önizleme Dosyası", "preview");
      if (cover) coverUrl = await uploadFile(cover, "Kapak Görseli");

      const licensePayload = await Promise.all(
        LICENSE_TIERS.map(async (tier) => {
          const lic = licenses[tier.type];
          const fileUrl = await uploadFile(lic.file as File, tier.label, "license");
          return { type: tier.type, price: parseFloat(lic.price), fileUrl };
        })
      );

      const beatData = {
        title,
        genre,
        bpm: parseInt(bpm),
        taggedAudioUrl,
        coverUrl,
        licenses: licensePayload,
      };

      const res = await fetch("/api/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beatData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Veritabanına kaydedilirken hata oluştu.");
      }

      setMessage("Beat başarıyla yüklendi ve kataloğa eklendi!");
      setTitle(""); setGenre(""); setBpm("");
      setTaggedAudio(null); setCover(null);
      setLicenses({
        BASIC: { price: "", file: null },
        PREMIUM: { price: "", file: null },
        UNLIMITED: { price: "", file: null },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.");
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
            <FileAudio size={14} /> Tagged Ses Dosyası (Sitede dinletmek için önizleme, opsiyonel — maks. 3MB, 128kbps MP3 önerilir)
          </label>
          <input type="file" accept="audio/*" onChange={e => setTaggedAudio(e.target.files?.[0] || null)} />
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '10px 0' }} />

        <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>Lisans Tier&apos;leri (3&apos;ü de zorunlu)</div>

        {LICENSE_TIERS.map((tier) => (
          <div key={tier.type} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
              {tier.type === "UNLIMITED" ? <Archive size={16} /> : <Music size={16} />}
              {tier.label}
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Fiyat (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500"
                  value={licenses[tier.type].price}
                  onChange={(e) => setLicensePrice(tier.type, e.target.value)}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{tier.hint}</label>
                <input
                  type="file"
                  accept={tier.accept}
                  required
                  onChange={(e) => setLicenseFile(tier.type, e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        ))}

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
