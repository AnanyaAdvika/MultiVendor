import { prisma } from '../utils/prisma.js';
import { calculateTrustScore } from './trustScore.service.js';

export interface VendorAlternative {
  productId: string;
  vendorId: string;
  storeName: string;
  vendorTrustScore: number;
  vendorRating: number;
  vendorBadge: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent: number;
  stock: number;
  isEcoFriendly: boolean;
  isCurrentItem: boolean;
  isBestDeal: boolean;
  savingsVsCurrent: number; // Positive if cheaper than current
}

export interface SmartCartSavingItem {
  cartItemId: string;
  currentProductId: string;
  productTitle: string;
  currentVendorId: string;
  currentVendorName: string;
  currentPrice: number;
  quantity: number;
  cheaperAlternative: {
    productId: string;
    productTitle: string;
    vendorId: string;
    vendorName: string;
    price: number;
    pricePerUnitDiff: number;
    totalSavings: number;
    vendorTrustScore: number;
    vendorBadge: string;
  } | null;
}

export interface SmartCartSavingsSummary {
  items: SmartCartSavingItem[];
  totalAlternativeSavings: number;
  hasCheaperAlternatives: boolean;
  recommendedCoupons: Array<{
    code: string;
    description: string | null;
    estimatedDiscount: number;
  }>;
}

/**
 * Find all vendor deals for a specific product's catalog group or SKU.
 */
export async function getProductDealsComparison(productId: string) {
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: true,
      category: true,
    },
  });

  if (!currentProduct) return null;

  // If no catalogGroup, search for other products with identical title or SKU
  const catalogGroup = currentProduct.catalogGroup || currentProduct.sku;

  let alternatives: any[] = [];
  if (catalogGroup) {
    alternatives = await prisma.product.findMany({
      where: {
        OR: [
          { catalogGroup: catalogGroup },
          { sku: catalogGroup },
        ],
        isActive: true,
        vendor: {
          status: 'APPROVED',
        },
      },
      include: {
        vendor: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  } else {
    alternatives = [currentProduct];
  }

  // Find lowest price among all
  const lowestPrice = Math.min(...alternatives.map((p) => p.price));

  const deals: VendorAlternative[] = alternatives.map((item) => {
    const isCurrent = item.id === currentProduct.id;
    const isBest = item.price === lowestPrice;
    const savings = currentProduct.price - item.price;
    const trust = calculateTrustScore(item.vendor);

    return {
      productId: item.id,
      vendorId: item.vendor.id,
      storeName: item.vendor.storeName,
      vendorTrustScore: trust.trustScore,
      vendorRating: item.vendor.rating,
      vendorBadge: trust.badgeLabel,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      discountPercent: item.discountPercent,
      stock: item.stock,
      isEcoFriendly: item.isEcoFriendly,
      isCurrentItem: isCurrent,
      isBestDeal: isBest,
      savingsVsCurrent: savings > 0 ? savings : 0,
    };
  });

  return {
    currentProduct,
    deals,
    bestDealPrice: lowestPrice,
    maxPossibleSavings: Math.max(0, currentProduct.price - lowestPrice),
  };
}

/**
 * Analyzes the user's cart to find cheaper vendor alternatives & coupon savings.
 */
export async function analyzeCartSavings(cartId: string): Promise<SmartCartSavingsSummary> {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        include: {
          vendor: true,
        },
      },
    },
  });

  let totalAlternativeSavings = 0;
  const savingItems: SmartCartSavingItem[] = [];

  for (const item of cartItems) {
    const group = item.product.catalogGroup || item.product.sku;
    let cheaperAlt = null;

    if (group) {
      // Find cheaper active alternative from an approved vendor with stock
      const cheaperProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { catalogGroup: group },
            { sku: group },
          ],
          isActive: true,
          stock: { gte: item.quantity },
          price: { lt: item.product.price },
          id: { not: item.product.id },
          vendor: {
            status: 'APPROVED',
          },
        },
        include: {
          vendor: true,
        },
        orderBy: {
          price: 'asc',
        },
      });

      if (cheaperProduct) {
        const unitDiff = item.product.price - cheaperProduct.price;
        const totalSavings = unitDiff * item.quantity;
        const trust = calculateTrustScore(cheaperProduct.vendor);

        totalAlternativeSavings += totalSavings;
        cheaperAlt = {
          productId: cheaperProduct.id,
          productTitle: cheaperProduct.title,
          vendorId: cheaperProduct.vendor.id,
          vendorName: cheaperProduct.vendor.storeName,
          price: cheaperProduct.price,
          pricePerUnitDiff: unitDiff,
          totalSavings,
          vendorTrustScore: trust.trustScore,
          vendorBadge: trust.badgeLabel,
        };
      }
    }

    savingItems.push({
      cartItemId: item.id,
      currentProductId: item.productId,
      productTitle: item.product.title,
      currentVendorId: item.product.vendor.id,
      currentVendorName: item.product.vendor.storeName,
      currentPrice: item.product.price,
      quantity: item.quantity,
      cheaperAlternative: cheaperAlt,
    });
  }

  // Find eligible coupons
  const subtotal = cartItems.reduce((acc, ci) => acc + ci.product.price * ci.quantity, 0);
  const hasEco = cartItems.some((ci) => ci.product.isEcoFriendly);

  const activeCoupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      minOrderAmount: { lte: subtotal },
    },
  });

  const recommendedCoupons = activeCoupons
    .filter((c) => !c.isEcoOnly || hasEco)
    .map((c) => {
      let estimatedDiscount = 0;
      if (c.discountType === 'PERCENTAGE') {
        estimatedDiscount = (subtotal * c.discountValue) / 100;
        if (c.maxDiscount) estimatedDiscount = Math.min(estimatedDiscount, c.maxDiscount);
      } else {
        estimatedDiscount = c.discountValue;
      }
      return {
        code: c.code,
        description: c.description,
        estimatedDiscount: Math.round(estimatedDiscount),
      };
    })
    .sort((a, b) => b.estimatedDiscount - a.estimatedDiscount);

  return {
    items: savingItems,
    totalAlternativeSavings,
    hasCheaperAlternatives: totalAlternativeSavings > 0,
    recommendedCoupons,
  };
}
