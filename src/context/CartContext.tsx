
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
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > product.stock) {
        toast({
          title: "Stock limit reached",
          description: `Cannot add more ${product.name} to cart. Only ${product.stock} available.`,
          variant: "destructive"
        });
        // Update to max stock if user tries to add more
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: product.stock } : item
          )
        );
        return; 
      }
      // If not exceeding stock, proceed to update quantity
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        )
      );
      toast({ title: "Item updated in cart", description: `${product.name} quantity increased.` });
    } else { // New item
      if (quantityToAdd > product.stock) {
        toast({
          title: "Stock limit reached",
          description: `Cannot add ${quantityToAdd} of ${product.name}. Only ${product.stock} available.`,
          variant: "destructive"
        });
        // Add with max stock
        setCartItems(prevItems => [...prevItems, { ...product, quantity: product.stock }]);
        return; 
      }
      // Add new item
      setCartItems(prevItems => [...prevItems, { ...product, quantity: quantityToAdd }]);
      toast({ title: "Item added to cart", description: `${product.name} has been added.` });
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({ title: "Item removed", description: "Item removed from cart." });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const itemToUpdate = cartItems.find(item => item.id === productId);
    if (!itemToUpdate) return;

    if (quantity <= 0) {
      removeFromCart(productId); // This will also trigger its own toast
      return;
    }

    if (quantity > itemToUpdate.stock) {
      toast({
        title: "Stock limit reached",
        description: `Max quantity for ${itemToUpdate.name} is ${itemToUpdate.stock}.`,
        variant: "destructive"
      });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: itemToUpdate.stock } : item
        )
      );
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    // No toast for a simple successful quantity update, as the UI reflects the change.
    // Toasts are primarily for validation errors or explicit actions like add/remove.
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
