import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getProductDealsComparison } from '../services/savings.service.js';
import { calculateTrustScore } from '../services/trustScore.service.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const {
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      minRating,
      ecoFriendly,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.max(1, parseInt(limit as string) || 12);
    const skip = (pageNum - 1) * take;

    const where: any = {
      isActive: true,
      vendor: {
        status: 'APPROVED',
      },
    };

    if (search) {
      const term = String(search).trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { sku: { contains: term } },
      ];
    }

    if (category) {
      where.category = {
        OR: [
          { slug: String(category) },
          { id: String(category) },
        ],
      };
    }

    if (vendor) {
      where.vendor = {
        OR: [
          { slug: String(vendor) },
          { id: String(vendor) },
        ],
        status: 'APPROVED',
      };
    }

    if (ecoFriendly === 'true') {
      where.isEcoFriendly = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating_desc') orderBy = { rating: 'desc' };
    else if (sort === 'discount_desc') orderBy = { discountPercent: 'desc' };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              slug: true,
              rating: true,
              trustScore: true,
              isEcoFriendlyCertified: true,
              successfulOrders: true,
              cancelledOrders: true,
              onTimeDeliveries: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    // Attach trust score metrics to each vendor
    const formattedProducts = products.map((p) => {
      const trust = calculateTrustScore(p.vendor);
      return {
        ...p,
        images: JSON.parse(p.images || '[]'),
        vendor: {
          ...p.vendor,
          trustMetrics: trust,
        },
      };
    });

    return sendSuccess(res, {
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getFeaturedProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        vendor: { status: 'APPROVED' },
      },
      include: {
        vendor: true,
        category: true,
      },
      take: 8,
      orderBy: { rating: 'desc' },
    });

    const formatted = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      vendor: {
        ...p.vendor,
        trustMetrics: calculateTrustScore(p.vendor),
      },
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return sendSuccess(res, categories);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getProductBySlugOrId(req: Request, res: Response) {
  try {
    const { identifier } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
        isActive: true,
      },
      include: {
        vendor: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Get Best Deal Comparison across vendors
    const dealsComparison = await getProductDealsComparison(product.id);

    return sendSuccess(res, {
      ...product,
      images: JSON.parse(product.images || '[]'),
      vendor: {
        ...product.vendor,
        trustMetrics: calculateTrustScore(product.vendor),
      },
      dealsComparison,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getProductDeals(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comparison = await getProductDealsComparison(id);
    if (!comparison) return sendError(res, 'Product not found', 404);

    return sendSuccess(res, comparison);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
