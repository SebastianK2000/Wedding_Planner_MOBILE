import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  uniqueId: string;
  id: number;
  type: 'venue' | 'photographer' | 'musician' | 'florist' | 'transport';
  name: string;
  price: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'uniqueId'>) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'uniqueId'>) => {
    const uniqueId = `${newItem.type}-${newItem.id}-${Date.now()}`;
    setItems((prev) => [...prev, { ...newItem, uniqueId }]);
  };

  const removeFromCart = (uniqueId: string) => {
    setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}