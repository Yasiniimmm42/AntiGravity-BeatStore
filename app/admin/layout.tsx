"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Undo2,
  Tag,
  Settings,
  Music,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const links = [
    { href: "/admin", label: "Hesap Özeti", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/products", label: "Ürünler", icon: <Package size={18} /> },
    { href: "/admin/orders", label: "Siparişler", icon: <ShoppingCart size={18} /> },
    { href: "/admin/payouts", label: "Tahsilatlar", icon: <Wallet size={18} /> },
    { href: "/admin/returns", label: "İadeler", icon: <Undo2 size={18} /> },
    { href: "/admin/discounts", label: "İndirimler", icon: <Tag size={18} /> },
    { href: "/admin/settings", label: "Ayarlar", icon: <Settings size={18} /> },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#18181b', /* zinc-900 */
        borderRight: '1px solid #27272a', /* zinc-800 */
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
                    background: isActive ? '#27272a' : 'transparent',
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
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#27272a', borderRadius: '8px', zIndex: 1 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '20px', borderTop: '1px solid #27272a' }}>
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: 500, fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={18} />
            Çıkış Yap
          </motion.button>
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
