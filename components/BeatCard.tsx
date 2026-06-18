"use client";

import { useCart } from "./CartProvider";
import { Play, ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Beat = {
  id: number;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  price: number;
  coverUrl?: string | null;
  taggedAudioUrl?: string | null;
  untaggedAudioUrl: string;
};

export function BeatCard({ beat, onPlay }: { beat: Beat; onPlay: (beat: Beat) => void }) {
  const { addToCart, items } = useCart();
  const inCart = items.some(i => i.id === beat.id);

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
      </div>
      
      <div style={{ padding: '0 5px' }}>
        <Link href={`/beat/${beat.slug}`}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.5px' }}>{beat.title}</h3>
        </Link>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{beat.genre} • {beat.bpm} BPM</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '0 5px 5px 5px' }}>
        <span style={{ fontSize: '16px', fontWeight: '600' }}>₺{beat.price.toFixed(2)}</span>
        
        <motion.button 
          whileHover={!inCart ? { scale: 1.05 } : {}}
          whileTap={!inCart ? { scale: 0.95 } : {}}
          className={inCart ? "btn-outline" : "btn-primary"} 
          onClick={() => !inCart && addToCart(beat as any)} 
          disabled={inCart} 
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px', minWidth: '100px' }}
        >
          {inCart ? <><Check size={16}/> Eklendi</> : <><ShoppingCart size={16}/> Satın Al</>}
        </motion.button>
      </div>
    </motion.div>
  );
}
