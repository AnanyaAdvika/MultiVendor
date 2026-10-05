import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getAddresses(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });

    return sendSuccess(res, addresses);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function addAddress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { fullName, phone, street, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return sendError(res, 'Missing required address fields', 400);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
    });

    return sendSuccess(res, address, 'Address added', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    await prisma.address.deleteMany({
      where: { id, userId: req.user.id },
    });

    return sendSuccess(res, null, 'Address deleted');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
