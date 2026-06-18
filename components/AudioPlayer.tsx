"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import { motion } from "framer-motion";

export function AudioPlayer({ filename, title, cover }: { filename: string | null; title: string; cover?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // İndirme yöneticilerinin (IDM vb.) yakalayabileceği doğrudan bir medya
  // URL'i hiç ortaya çıkmasın diye: önce kısa ömürlü/tek kullanımlık bir
  // token alınır, sonra ses verisi fetch ile blob olarak çekilip
  // URL.createObjectURL ile yerel bir blob: URL'e dönüştürülür.
  useEffect(() => {
    let cancelled = false;

    async function loadAudio() {
      if (!filename) return;
      setBlobUrl(null);
      setLoading(true);
      try {
        const tokenRes = await fetch(`/api/preview/${filename}/token`, { credentials: "include" });
        if (!tokenRes.ok) throw new Error("Token alınamadı.");
        const { token } = await tokenRes.json();

        const audioRes = await fetch(`/api/preview/${filename}?token=${encodeURIComponent(token)}`, {
          credentials: "include",
        });
        if (!audioRes.ok) throw new Error("Ses verisi alınamadı.");
        const blob = await audioRes.blob();
        if (cancelled) return;

        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
      } catch (err) {
        console.error("Önizleme yüklenemedi", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAudio();

    return () => {
      cancelled = true;
    };
  }, [filename]);

  // Component unmount olduğunda son blob URL'i de temizle (memory leak önleme).
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && blobUrl) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(err => console.error("Auto-play prevented", err));
      setIsPlaying(true);
    }
  }, [blobUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Play prevented", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!filename) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass-panel" 
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        width: '90%',
        maxWidth: '850px',
        padding: '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Sol Taraf: Görsel ve Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1.5 }}>
          {cover ? (
            <img src={cover} alt="Kapak" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
          ) : (
            <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={20} color="var(--muted)" />
            </div>
          )}
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{loading ? "Yükleniyor..." : "Önizleme Çalıyor..."}</p>
          </div>
        </div>
        
        {/* Orta: İleri Geri Sarma Çubuğu (Progress Bar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 2, justifyContent: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '35px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress} 
            onChange={handleSeek}
            style={{ width: '100%', cursor: 'pointer', height: '4px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '35px', fontVariantNumeric: 'tabular-nums' }}>{formatTime(duration)}</span>
        </div>

        {/* Sağ Taraf: Ses Ayarı ve Oynatma Butonu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1.5, justifyContent: 'flex-end' }}>
          
          {/* Ses (Volume) Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {volume === 0 ? <VolumeX size={16} color="var(--muted)" /> : <Volume2 size={16} color="var(--muted)" />}
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01} 
              value={volume} 
              onChange={handleVolumeChange}
              style={{ width: '70px', cursor: 'pointer', height: '4px' }}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay} 
            className="btn-primary" 
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isPlaying ? <Pause fill="#000" size={18} /> : <Play fill="#000" size={18} style={{ marginLeft: '2px' }} />}
          </motion.button>
        </div>
      </div>

      {/* Gizli Audio Etiketi */}
      <audio
        ref={audioRef}
        src={blobUrl ?? undefined}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </motion.div>
  );
}
