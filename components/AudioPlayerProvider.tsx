"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AudioPlayer } from "./AudioPlayer";

type Track = {
  filename: string;
  title: string;
  cover?: string;
};

type AudioPlayerContextType = {
  playTrack: (filename: string, title: string, cover?: string) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

// Root layout'ta render edilir, bu yüzden sayfa içi gezinmelerde (client-side
// navigation) hiç unmount olmaz — çalan parça sayfa değiştiğinde kesilmez.
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);

  const playTrack = (filename: string, title: string, cover?: string) => {
    setTrack({ filename, title, cover });
  };

  return (
    <AudioPlayerContext.Provider value={{ playTrack }}>
      {children}
      <AudioPlayer filename={track?.filename ?? null} title={track?.title ?? ""} cover={track?.cover} />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
