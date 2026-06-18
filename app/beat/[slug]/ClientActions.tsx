"use client";

import { useCart, cartKey } from "@/components/CartProvider";
import type { LicenseType } from "@/components/CartProvider";
import { ShoppingCart, Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState } from "react";
import { LICENSE_INFO, LICENSE_ORDER } from "@/lib/licenses";
import { getPreviewFilename } from "@/lib/preview";

type License = {
  type: LicenseType;
  price: number;
};

type Beat = {
  id: number;
  slug: string;
  title: string;
  coverUrl?: string;
  taggedAudioUrl?: string | null;
  licenses: License[];
};

export function ClientActions({ beat }: { beat: Beat }) {
  const { addToCart, items } = useCart();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<LicenseType>("BASIC");

  const sortedLicenses = [...beat.licenses].sort(
    (a, b) => LICENSE_ORDER.indexOf(a.type) - LICENSE_ORDER.indexOf(b.type)
  );
  const selectedLicense = sortedLicenses.find((l) => l.type === selected) ?? sortedLicenses[0];
  const inCart = items.some((i) => cartKey(i.beatId, i.licenseType) === cartKey(beat.id, selected));
  const previewFilename = getPreviewFilename(beat.taggedAudioUrl);

  const handleAddToCart = () => {
    if (inCart || !selectedLicense) return;
    addToCart({
      beatId: beat.id,
      beatSlug: beat.slug,
      licenseType: selectedLicense.type,
      title: beat.title,
      price: selectedLicense.price,
      coverUrl: beat.coverUrl,
    });
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {sortedLicenses.map((lic) => {
          const info = LICENSE_INFO[lic.type];
          const isSelected = selected === lic.type;
          return (
            <motion.button
              key={lic.type}
              onClick={() => setSelected(lic.type)}
              whileHover={{ scale: 1.01 }}
              className="glass-panel"
              style={{
                padding: '16px',
                textAlign: 'left',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? 'rgba(255,255,255,0.06)' : undefined,
                color: 'var(--foreground)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>{info.label}</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)' }}>₺{lic.price.toFixed(2)}</span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{info.summary}</span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <motion.button
          whileHover={previewFilename ? { scale: 1.02 } : {}}
          whileTap={previewFilename ? { scale: 0.98 } : {}}
          onClick={() => previewFilename && setIsPlaying(true)}
          disabled={!previewFilename}
          className="btn-outline"
          style={{ flex: 1, padding: '16px', fontSize: '16px', opacity: previewFilename ? 1 : 0.5, cursor: previewFilename ? 'pointer' : 'not-allowed' }}
        >
          <Play size={20} /> {previewFilename ? "Dinle" : "Önizleme Yok"}
        </motion.button>
        <motion.button
          whileHover={!inCart ? { scale: 1.02 } : {}}
          whileTap={!inCart ? { scale: 0.98 } : {}}
          className={inCart ? "btn-outline" : "btn-primary"}
          onClick={handleAddToCart}
          disabled={inCart}
          style={{ flex: 2, padding: '16px', fontSize: '16px' }}
        >
          {inCart ? <><Check size={20} /> Sepete Eklendi</> : <><ShoppingCart size={20} /> Sepete Ekle</>}
        </motion.button>
      </div>

      {isPlaying && previewFilename && (
        <AudioPlayer
          filename={previewFilename}
          title={beat.title}
          cover={beat.coverUrl || undefined}
        />
      )}
    </>
  );
}
