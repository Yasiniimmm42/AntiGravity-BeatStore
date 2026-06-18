"use client";

import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type License = {
  type: "BASIC" | "PREMIUM" | "UNLIMITED";
  price: number;
};

type Beat = {
  id: number;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  coverUrl?: string | null;
  taggedAudioUrl?: string | null;
  licenses: License[];
};

export function BeatCard({ beat, onPlay }: { beat: Beat; onPlay: (beat: Beat) => void }) {
  const basicPrice = beat.licenses.find((l) => l.type === "BASIC")?.price ?? 0;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass"
      style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
        <Link href={`/beat/${beat.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {beat.coverUrl ? (
            <img src={beat.coverUrl} alt={beat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="card-img" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Görsel Yok
            </div>
          )}
        </Link>

        {/* Play Overlay */}
        {beat.taggedAudioUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'none' }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); onPlay(beat); }}
              style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(255,255,255,0.2)', pointerEvents: 'auto', border: 'none', cursor: 'pointer' }}
            >
              <Play fill="#000" color="#000" size={20} style={{ marginLeft: '4px' }} />
            </motion.button>
          </motion.div>
        )}
      </div>

      <div style={{ padding: '0 5px' }}>
        <Link href={`/beat/${beat.slug}`}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.5px' }}>{beat.title}</h3>
        </Link>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{beat.genre} • {beat.bpm} BPM</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '0 5px 5px 5px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>₺{basicPrice.toFixed(2)}&apos;den başlıyor</span>

        <Link
          href={`/beat/${beat.slug}`}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
        >
          Fiyatları Gör <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
