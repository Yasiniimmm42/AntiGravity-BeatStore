"use client";

import { useCart } from "@/components/CartProvider";
import { ShoppingCart, Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState } from "react";

export function ClientActions({ beat }: { beat: any }) {
  const { addToCart, items } = useCart();
  const [isPlaying, setIsPlaying] = useState(false);
  const inCart = items.some(i => i.id === beat.id);

  return (
    <>
      <div style={{ display: 'flex', gap: '15px' }}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsPlaying(true)}
          className="btn-outline" 
          style={{ flex: 1, padding: '16px', fontSize: '16px' }}
        >
          <Play size={20} /> Dinle
        </motion.button>
        <motion.button 
          whileHover={!inCart ? { scale: 1.02 } : {}}
          whileTap={!inCart ? { scale: 0.98 } : {}}
          className={inCart ? "btn-outline" : "btn-primary"} 
          onClick={() => !inCart && addToCart(beat)} 
          disabled={inCart} 
          style={{ flex: 2, padding: '16px', fontSize: '16px' }}
        >
          {inCart ? <><Check size={20} /> Sepete Eklendi</> : <><ShoppingCart size={20} /> Sepete Ekle</>}
        </motion.button>
      </div>
      
      {isPlaying && (
        <AudioPlayer 
          src={beat.taggedAudioUrl || beat.untaggedAudioUrl} 
          title={beat.title}
          cover={beat.coverUrl || undefined}
        />
      )}
    </>
  );
}
