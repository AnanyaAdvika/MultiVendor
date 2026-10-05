import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { calculateTrustScore } from '../services/trustScore.service.js';

export async function getBestDealsOverview(req: Request, res: Response) {
  try {
    // Find all products that have a catalogGroup
    const productsWithGroup = await prisma.product.findMany({
      where: {
        catalogGroup: { not: null },
        isActive: true,
        vendor: { status: 'APPROVED' },
      },
      include: {
        vendor: true,
        category: true,
      },
    });

    // Group by catalogGroup
    const groups: { [key: string]: typeof productsWithGroup } = {};
    for (const p of productsWithGroup) {
      if (!p.catalogGroup) continue;
      if (!groups[p.catalogGroup]) groups[p.catalogGroup] = [];
      groups[p.catalogGroup].push(p);
    }

    // Filter to groups with 2 or more vendors
    const competitiveDeals = [];
    for (const [groupName, items] of Object.entries(groups)) {
      if (items.length >= 2) {
        items.sort((a, b) => a.price - b.price);
        const cheapest = items[0];
        const mostExpensive = items[items.length - 1];
        const savings = mostExpensive.price - cheapest.price;

        if (savings > 0) {
          competitiveDeals.push({
            groupName,
            title: cheapest.title,
            category: cheapest.category.name,
            cheapestPrice: cheapest.price,
            highestPrice: mostExpensive.price,
            maxSavings: savings,
            savingsPercent: Math.round((savings / mostExpensive.price) * 100),
            cheapestVendor: {
              id: cheapest.vendor.id,
              storeName: cheapest.vendor.storeName,
              trustMetrics: calculateTrustScore(cheapest.vendor),
            },
            cheapestProduct: {
              id: cheapest.id,
              slug: cheapest.slug,
              images: JSON.parse(cheapest.images || '[]'),
              isEcoFriendly: cheapest.isEcoFriendly,
            },
            totalVendorsCompeting: items.length,
          });
        }
      }
    }

    return sendSuccess(res, competitiveDeals);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
