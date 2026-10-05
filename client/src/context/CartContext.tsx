import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartResponse } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  switchVendor: (cartItemId: string, targetProductId: string) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      error('Please sign in to add items to your cart');
      return;
    }
    try {
      await api.addToCart(productId, quantity);
      success('Item added to cart!');
      await fetchCart();
    } catch (err: any) {
      error(err.message || 'Could not add to cart');
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await api.updateCartQty(cartItemId, quantity);
      await fetchCart();
    } catch (err: any) {
      error(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await api.removeCartItem(cartItemId);
      success('Item removed from cart');
      await fetchCart();
    } catch (err: any) {
      error(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await fetchCart();
    } catch (err: any) {
      error(err.message || 'Failed to clear cart');
    }
  };

  const switchVendor = async (cartItemId: string, targetProductId: string) => {
    try {
      const res = await api.switchVendor(cartItemId, targetProductId);
      success(res?.message || 'Switched to cheaper vendor alternative!');
      await fetchCart();
    } catch (err: any) {
      error(err.message || 'Failed to switch vendor');
    }
  };

  const itemCount = cart?.totalItemsCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        switchVendor,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
