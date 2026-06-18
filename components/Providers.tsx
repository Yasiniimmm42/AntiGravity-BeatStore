"use client";

import { CartProvider } from "./CartProvider";
import { AudioPlayerProvider } from "./AudioPlayerProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AudioPlayerProvider>
        {children}
      </AudioPlayerProvider>
    </CartProvider>
  );
}
