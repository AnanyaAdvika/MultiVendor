import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: {
              select: { id: true, storeName: true, trustScore: true },
            },
          },
        },
      },
    });

    const formatted = wishlist.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images || '[]'),
      },
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { productId } = req.body;
    if (!productId) return sendError(res, 'productId is required', 400);

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await prisma.wishlist.create({
        data: {
          userId: req.user.id,
          productId,
        },
      });
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
