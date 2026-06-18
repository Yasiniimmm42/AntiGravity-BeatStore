"use client";

import { useCart } from "./CartProvider";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CartModal } from "./CartModal";
import Link from "next/link";

export function Navbar() {
  const { items, total } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass" 
        style={{ margin: '20px auto', maxWidth: '1200px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '20px', zIndex: 100 }}
      >
        <Link href="/">
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-1px' }}>
            STUDIO<span style={{ color: 'var(--muted)', fontWeight: 400 }}>BEATS</span>
          </h2>
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            <ShoppingCart size={16} color="var(--muted)" />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted)' }}>({items.length})</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>₺{total.toFixed(2)}</span>
          </motion.div>
        </div>
      </motion.nav>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
