
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'silvuCart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > product.stock) {
            toast({ title: "Stock limit reached", description: `Cannot add more ${product.name} to cart.`, variant: "destructive" });
            return prevItems.map(item =>
              item.id === product.id ? { ...item, quantity: product.stock } : item
            );
        }
        toast({ title: "Item updated in cart", description: `${product.name} quantity increased.` });
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      if (quantityToAdd > product.stock) {
        toast({ title: "Stock limit reached", description: `Cannot add ${quantityToAdd} of ${product.name} to cart. Available: ${product.stock}`, variant: "destructive" });
        return [...prevItems, { ...product, quantity: product.stock }];
      }
      toast({ title: "Item added to cart", description: `${product.name} has been added.` });
      return [...prevItems, { ...product, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({ title: "Item removed", description: "Item removed from cart." });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          if (quantity <= 0) {
            return null; // Will be filtered out
          }
          if (quantity > item.stock) {
            toast({ title: "Stock limit reached", description: `Max quantity for ${item.name} is ${item.stock}.`, variant: "destructive" });
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast({ title: "Cart cleared", description: "All items removed from cart." });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
