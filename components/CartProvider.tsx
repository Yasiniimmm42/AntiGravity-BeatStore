"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LicenseType = "BASIC" | "PREMIUM" | "UNLIMITED";

export type CartItem = {
  beatId: number;
  beatSlug: string;
  licenseType: LicenseType;
  title: string;
  price: number;
  coverUrl?: string;
};

export type AppliedDiscount = { code: string; percent: number } | null;

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  total: number;
  discount: AppliedDiscount;
  discountedTotal: number;
  applyDiscount: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeDiscount: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "beatstore_cart";

export function cartKey(beatId: number, licenseType: string) {
  return `${beatId}-${licenseType}`;
}

type StoredCart = { items: CartItem[]; discount: AppliedDiscount };

function readStoredCart(): StoredCart {
  if (typeof window === "undefined") return { items: [], discount: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { items: [], discount: null };
    const parsed = JSON.parse(stored);
    // Eski format düz bir CartItem dizisiydi (kupon desteğinden önce) — geriye uyumluluk.
    if (Array.isArray(parsed)) return { items: parsed, discount: null };
    return { items: parsed.items ?? [], discount: parsed.discount ?? null };
  } catch {
    return { items: [], discount: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart().items);
  const [discount, setDiscount] = useState<AppliedDiscount>(() => readStoredCart().discount);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, discount }));
  }, [items, discount]);

  const addToCart = (item: CartItem) => {
    const key = cartKey(item.beatId, item.licenseType);
    setItems((prev) => (prev.find((i) => cartKey(i.beatId, i.licenseType) === key) ? prev : [...prev, item]));
  };

  const removeFromCart = (key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i.beatId, i.licenseType) !== key));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(null);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const discountedTotal = discount ? Math.round(total * (1 - discount.percent / 100) * 100) / 100 : total;

  const applyDiscount = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, error: data.error || "Kupon geçersiz." };
      }
      setDiscount({ code: code.trim().toUpperCase(), percent: data.discountPercent });
      return { success: true };
    } catch {
      return { success: false, error: "Kupon doğrulanamadı." };
    }
  };

  const removeDiscount = () => setDiscount(null);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, total, discount, discountedTotal, applyDiscount, removeDiscount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
