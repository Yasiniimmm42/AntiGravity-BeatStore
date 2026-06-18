import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BeatCard } from "@/components/BeatCard";

// Next.js App Router (Server Component)
export default async function BeatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const beat = await prisma.beat.findUnique({
    where: { slug },
  });

  if (!beat) {
    notFound();
  }

  return (
    <main className="container" style={{ padding: '60px 20px', paddingBottom: '120px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        
        {/* Sol Taraf: Görsel */}
        <div style={{ flex: '1 1 400px' }}>
          {beat.coverUrl ? (
            <img 
              src={beat.coverUrl} 
              alt={beat.title} 
              style={{ width: '100%', height: 'auto', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
            />
          ) : (
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--surface)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '24px' }}>
              Görsel Yok
            </div>
          )}
        </div>

        {/* Sağ Taraf: Bilgiler ve Satın Alma */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '10px' }}>{beat.title}</h1>
            <p style={{ fontSize: '20px', color: 'var(--muted)', fontWeight: 500 }}>{beat.genre} • {beat.bpm} BPM</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
              <span style={{ fontSize: '16px', color: 'var(--muted)' }}>Standart Lisans (Untagged)</span>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>₺{beat.price.toFixed(2)}</span>
            </div>

            {/* Client bileşenine çevirdiğimiz BeatCard'ı burada sadece fonksiyonellik için kullanmıyoruz. 
                Satın alma işlemi client side olduğu için ayrı bir client component butonu koymak daha iyi olur,
                ancak şimdilik sadece bu sayfanın genel yapısını gösterelim. 
                Sepete Ekle butonu için Client component sarmalayıcıya ihtiyacımız var. 
                Onun yerine ufak bir client component yazalım.
            */}
            <ClientActions beat={beat as any} />
            
          </div>
          
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 600 }}>Lisans Detayları</h3>
            <ul style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>Untagged WAV / MP3 Dosyası</li>
              <li>Tüm dijital platformlarda yayınlama hakkı</li>
              <li>Müzik klibi ve performans hakkı</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

// Inline Client Component for the buttons
import { ClientActions } from "./ClientActions";
