"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: number;
  title: string;
  price: number;
  coverUrl?: string;
  untaggedAudioUrl: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    if (!items.find((i) => i.id === item.id)) {
      setItems([...items, item]);
    }
  };

  const removeFromCart = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, total }}>
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
