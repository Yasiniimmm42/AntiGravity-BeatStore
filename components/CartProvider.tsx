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

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "beatstore_cart";

export function cartKey(beatId: number, licenseType: string) {
  return `${beatId}-${licenseType}`;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    const key = cartKey(item.beatId, item.licenseType);
    setItems((prev) => (prev.find((i) => cartKey(i.beatId, i.licenseType) === key) ? prev : [...prev, item]));
  };

  const removeFromCart = (key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i.beatId, i.licenseType) !== key));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
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
