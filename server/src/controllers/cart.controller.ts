import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { analyzeCartSavings } from '../services/savings.service.js';
import { calculateTrustScore } from '../services/trustScore.service.js';

export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  vendor: true,
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    // Group items by Vendor to show "One Cart, Multiple Vendors" preview!
    const vendorGroups: { [vendorId: string]: { vendor: any; items: any[]; subtotal: number } } = {};
    let grandSubtotal = 0;
    let totalItemsCount = 0;
    let hasEcoFriendlyItems = false;

    for (const item of cart.items) {
      const v = item.product.vendor;
      if (!vendorGroups[v.id]) {
        vendorGroups[v.id] = {
          vendor: {
            id: v.id,
            storeName: v.storeName,
            slug: v.slug,
            trustMetrics: calculateTrustScore(v),
          },
          items: [],
          subtotal: 0,
        };
      }

      const itemTotal = item.product.price * item.quantity;
      grandSubtotal += itemTotal;
      totalItemsCount += item.quantity;
      if (item.product.isEcoFriendly) hasEcoFriendlyItems = true;

      vendorGroups[v.id].items.push({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        title: item.product.title,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice,
        stock: item.product.stock,
        isEcoFriendly: item.product.isEcoFriendly,
        ecoDetails: item.product.ecoDetails,
        images: JSON.parse(item.product.images || '[]'),
        subtotal: itemTotal,
      });
      vendorGroups[v.id].subtotal += itemTotal;
    }

    // Run Smart Cart Savings analysis
    const savingsAnalysis = await analyzeCartSavings(cart.id);

    return sendSuccess(res, {
      cartId: cart.id,
      grandSubtotal,
      totalItemsCount,
      hasEcoFriendlyItems,
      vendorGroups: Object.values(vendorGroups),
      savingsAnalysis,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { productId, quantity = 1 } = req.body;
    if (!productId) return sendError(res, 'Product ID is required', 400);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return sendError(res, 'Product is unavailable', 404);
    }

    if (product.stock < quantity) {
      return sendError(res, `Only ${product.stock} items in stock`, 400);
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    // Check if already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) {
        return sendError(res, `Cannot add more. Stock limit: ${product.stock}`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return sendSuccess(res, null, 'Item added to cart', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateCartItemQuantity(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendError(res, 'Quantity must be at least 1', 400);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true, cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return sendError(res, 'Cart item not found', 404);
    }

    if (item.product.stock < quantity) {
      return sendError(res, `Only ${item.product.stock} available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return sendSuccess(res, null, 'Cart updated');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return sendError(res, 'Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Item removed from cart');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return sendSuccess(res, null, 'Cart cleared');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

/**
 * 1-Click "Switch to Cheaper Vendor Alternative":
 * Swaps a cart item to an equivalent item from another vendor offering a better deal!
 */
export async function switchCartItemVendor(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { cartItemId, targetProductId } = req.body;
    if (!cartItemId || !targetProductId) {
      return sendError(res, 'cartItemId and targetProductId are required', 400);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return sendError(res, 'Cart item not found', 404);
    }

    const targetProduct = await prisma.product.findUnique({
      where: { id: targetProductId },
      include: { vendor: true },
    });

    if (!targetProduct || !targetProduct.isActive || targetProduct.vendor.status !== 'APPROVED') {
      return sendError(res, 'Target product is unavailable', 400);
    }

    if (targetProduct.stock < item.quantity) {
      return sendError(res, 'Target vendor does not have enough stock', 400);
    }

    // Check if target product is already in cart
    const existingTargetInCart = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: item.cartId,
          productId: targetProductId,
        },
      },
    });

    if (existingTargetInCart) {
      // Merge quantity and delete original
      await prisma.cartItem.update({
        where: { id: existingTargetInCart.id },
        data: { quantity: existingTargetInCart.quantity + item.quantity },
      });
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Update item to target product
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { productId: targetProductId },
      });
    }

    return sendSuccess(res, null, `Switched vendor to ${targetProduct.vendor.storeName}!`);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
