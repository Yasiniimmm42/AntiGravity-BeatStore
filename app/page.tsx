"use client";

import { useEffect, useState } from "react";
import { BeatCard } from "@/components/BeatCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { motion } from "framer-motion";

type Beat = {
  id: number;
  title: string;
  genre: string;
  bpm: number;
  price: number;
  coverUrl?: string | null;
  taggedAudioUrl?: string | null;
  untaggedAudioUrl: string;
};

export default function Home() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBeats() {
      try {
        const res = await fetch("/api/beats");
        const data = await res.json();
        setBeats(data);
      } catch (err) {
        console.error("Failed to fetch beats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBeats();
  }, []);

  return (
    <main className="container" style={{ padding: '40px 20px', paddingBottom: '120px' }}>
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '60px', marginTop: '20px' }}
      >
        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '15px', color: 'var(--foreground)' }}>
          High Quality <span style={{ color: 'var(--muted)' }}>Instrumentals</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Dünya standartlarında prodüksiyon kalitesiyle üretilmiş profesyonel beat'leri keşfet ve satın al.
        </p>
      </motion.div>

      {/* Catalog Grid */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '25px', paddingLeft: '5px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
          Tüm Beatler
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>Yükleniyor...</div>
        ) : beats.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            Henüz yüklenmiş bir beat bulunmuyor. Yönetim panelinden yükleyebilirsiniz.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {beats.map((beat) => (
              <BeatCard 
                key={beat.id} 
                beat={beat} 
                onPlay={(b) => setCurrentBeat(b)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Persistent Audio Player */}
      {currentBeat && (
        <AudioPlayer 
          src={currentBeat.taggedAudioUrl || currentBeat.untaggedAudioUrl} 
          title={currentBeat.title}
          cover={currentBeat.coverUrl || undefined}
        />
      )}
    </main>
  );
}
