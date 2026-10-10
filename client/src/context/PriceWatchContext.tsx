import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.js';

export interface PriceWatchAlert {
  productId: string;
  productSlug: string;
  productTitle: string;
  currentPrice: number;
  targetPrice: number;
  productImage?: string;
  createdAt: string;
  notified?: boolean;
}

interface PriceWatchContextType {
  watchedItems: PriceWatchAlert[];
  setPriceWatch: (product: { id: string; slug: string; title: string; price: number; image?: string }, targetPrice: number) => void;
  removePriceWatch: (productId: string) => void;
  isWatching: (productId: string) => boolean;
  getWatchTarget: (productId: string) => number | undefined;
  checkPriceDrops: (currentProducts: Array<{ id: string; price: number; title: string }>) => void;
}

const PriceWatchContext = createContext<PriceWatchContextType | undefined>(undefined);

export function PriceWatchProvider({ children }: { children: React.ReactNode }) {
  const [watchedItems, setWatchedItems] = useState<PriceWatchAlert[]>(() => {
    try {
      const saved = localStorage.getItem('local_price_watch');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('local_price_watch', JSON.stringify(watchedItems));
    } catch (e) {
      console.error('Failed to save price watch list', e);
    }
  }, [watchedItems]);

  const setPriceWatch = (
    product: { id: string; slug: string; title: string; price: number; image?: string },
    targetPrice: number
  ) => {
    const existingIndex = watchedItems.findIndex((item) => item.productId === product.id);
    const newAlert: PriceWatchAlert = {
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      currentPrice: product.price,
      targetPrice,
      productImage: product.image,
      createdAt: new Date().toISOString(),
      notified: false,
    };

    if (existingIndex >= 0) {
      const updated = [...watchedItems];
      updated[existingIndex] = newAlert;
      setWatchedItems(updated);
      success(`Updated price watch target for ${product.title} to ₹${targetPrice}`);
    } else {
      setWatchedItems((prev) => [...prev, newAlert]);
      success(`Price watch activated! We'll alert you when ${product.title} drops below ₹${targetPrice}`);
    }
  };

  const removePriceWatch = (productId: string) => {
    setWatchedItems((prev) => prev.filter((item) => item.productId !== productId));
    info('Price watch removed.');
  };

  const isWatching = (productId: string) => {
    return watchedItems.some((item) => item.productId === productId);
  };

  const getWatchTarget = (productId: string) => {
    return watchedItems.find((item) => item.productId === productId)?.targetPrice;
  };

  const checkPriceDrops = (currentProducts: Array<{ id: string; price: number; title: string }>) => {
    watchedItems.forEach((watch) => {
      const live = currentProducts.find((p) => p.id === watch.productId);
      if (live && live.price <= watch.targetPrice && !watch.notified) {
        info(`🔥 Price Drop Alert! "${watch.productTitle}" is now ₹${live.price} (below your target ₹${watch.targetPrice})!`);
        // Mark as notified in state
        setWatchedItems((prev) =>
          prev.map((item) => (item.productId === watch.productId ? { ...item, notified: true } : item))
        );
      }
    });
  };

  return (
    <PriceWatchContext.Provider
      value={{
        watchedItems,
        setPriceWatch,
        removePriceWatch,
        isWatching,
        getWatchTarget,
        checkPriceDrops,
      }}
    >
      {children}
    </PriceWatchContext.Provider>
  );
}

export function usePriceWatch() {
  const context = useContext(PriceWatchContext);
  if (!context) {
    throw new Error('usePriceWatch must be used within a PriceWatchProvider');
  }
  return context;
}
