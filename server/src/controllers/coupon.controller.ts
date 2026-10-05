import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getActiveCoupons(req: Request, res: Response) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { discountValue: 'desc' },
    });
    return sendSuccess(res, coupons);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, orderAmount = 0, hasEcoItems = false } = req.body;
    if (!code) return sendError(res, 'Coupon code is required', 400);

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid or expired coupon code', 400);
    }

    if (coupon.isEcoOnly && !hasEcoItems) {
      return sendError(res, 'Coupon "ECOSAVE" is only valid for orders containing Eco-Friendly items!', 400);
    }

    if (orderAmount < coupon.minOrderAmount) {
      return sendError(res, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.round(discount);

    return sendSuccess(res, {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalAmount: Math.max(0, orderAmount - discount),
    }, 'Coupon applied successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
