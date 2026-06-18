"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UploadCloud, Settings, Music } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Katalog", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/upload", label: "Yeni Yükle", icon: <UploadCloud size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={18} color="#000" />
          </div>
          <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--foreground)', fontWeight: 700 }}>Yönetim Paneli</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ position: 'relative', display: 'block' }}>
                <motion.div 
                  whileHover={{ x: 4 }}
                  style={{ 
                    padding: '12px 15px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    color: isActive ? 'var(--foreground)' : 'var(--muted)', 
                    fontWeight: 500, 
                    borderRadius: '8px', 
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {link.icon}
                  {link.label}
                </motion.div>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', zIndex: 1 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)' }}>
          <Settings size={18} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Ayarlar</span>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
