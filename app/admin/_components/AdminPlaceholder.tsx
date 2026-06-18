"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

export function AdminPlaceholder({ title, icon: Icon = Construction }: { title: string; icon?: LucideIcon }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h1>

      <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} color="var(--muted)" />
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px', fontWeight: 500 }}>Bu sayfa yapım aşamasındadır.</p>
      </div>
    </motion.div>
  );
}
