import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Next.js App Router (Server Component)
export default async function BeatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // fileUrl sunucu bileşeninden istemciye (RSC payload) gönderilmiyor:
  // satın alınmamış dosyaların indirme linkini tarayıcıya sızdırmamak için
  // sadece tür/fiyat seçiliyor.
  const beat = await prisma.beat.findUnique({
    where: { slug },
    include: { licenses: { select: { id: true, type: true, price: true } } },
  });

  if (!beat) {
    notFound();
  }

  return (
    <main className="container" style={{ paddingTop: '60px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '120px' }}>
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
            <ClientActions beat={{ ...beat, coverUrl: beat.coverUrl ?? undefined }} />
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 600 }}>Lisans Sözleşmeleri</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.8 }}>
              Her lisansın tam hukuki metni (TR/ENG), satın alma sonrası sipariş onay sayfasında indirilebilir hale gelir.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Inline Client Component for the buttons
import { ClientActions } from "./ClientActions";
