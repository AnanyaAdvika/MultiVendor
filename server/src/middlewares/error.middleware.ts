import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled server error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) || ['Field'];
    return sendError(res, `A record with this ${fields.join(', ')} already exists`, 409);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  const message = err.message || 'Internal Server Error';
  const statusCode = err.statusCode || 500;
  return sendError(res, message, statusCode);
}
