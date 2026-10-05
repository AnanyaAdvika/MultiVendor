import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const {
      addressId,
      newAddress,
      paymentMethod = 'COD',
      couponCode,
      notes,
    } = req.body;

    // 1. Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty', 400);
    }

    // 2. Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.vendor.status !== 'APPROVED') {
        return sendError(res, `Product "${item.product.title}" is no longer available`, 400);
      }
      if (item.product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for "${item.product.title}". Only ${item.product.stock} left.`, 400);
      }
    }

    // 3. Resolve shipping address
    let resolvedAddressId = addressId;
    if (!resolvedAddressId && newAddress) {
      const createdAddr = await prisma.address.create({
        data: {
          userId: req.user.id,
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          postalCode: newAddress.postalCode,
          country: newAddress.country || 'India',
        },
      });
      resolvedAddressId = createdAddr.id;
    }

    if (!resolvedAddressId) {
      // Pick user's default address if available
      const defaultAddr = await prisma.address.findFirst({
        where: { userId: req.user.id },
      });
      resolvedAddressId = defaultAddr?.id;
    }

    // 4. Calculate subtotal & evaluate coupon
    let subtotal = 0;
    let hasEcoItems = false;
    for (const item of cart.items) {
      subtotal += item.product.price * item.quantity;
      if (item.product.isEcoFriendly) hasEcoItems = true;
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.isEcoOnly || hasEcoItems) {
          if (subtotal >= coupon.minOrderAmount) {
            appliedCoupon = coupon.code;
            if (coupon.discountType === 'PERCENTAGE') {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
            } else {
              discount = coupon.discountValue;
            }
          }
        }
      }
    }

    const shippingFee = subtotal > 1000 ? 0 : 50; // Free delivery over ₹1,000
    const tax = 0; // Inclusive of taxes
    const totalAmount = Math.max(0, subtotal - discount + shippingFee + tax);

    // 5. Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 6. Group items by vendor for Multi-Vendor Order Splitting!
    const vendorMap = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const vId = item.product.vendorId;
      if (!vendorMap.has(vId)) {
        vendorMap.set(vId, []);
      }
      vendorMap.get(vId)!.push(item);
    }

    // 7. Execute order creation in a Prisma transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create master customer order
      const newMasterOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          addressId: resolvedAddressId,
          subtotal,
          discount,
          couponCode: appliedCoupon,
          tax,
          shippingFee,
          totalAmount,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod,
          orderStatus: 'PLACED',
          notes,
        },
      });

      // Split order by vendor: Create individual VendorOrder and OrderItems
      for (const [vendorId, items] of vendorMap.entries()) {
        const vendorSubtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
        const commissionRate = 0.05; // 5% marketplace commission
        const commission = vendorSubtotal * commissionRate;
        const vendorEarnings = vendorSubtotal - commission;

        const vendorSubOrder = await tx.vendorOrder.create({
          data: {
            orderId: newMasterOrder.id,
            vendorId,
            subtotal: vendorSubtotal,
            shippingFee: 0,
            commission,
            vendorEarnings,
            status: 'PENDING',
          },
        });

        for (const item of items) {
          const itemImages = JSON.parse(item.product.images || '[]');
          await tx.orderItem.create({
            data: {
              orderId: newMasterOrder.id,
              vendorOrderId: vendorSubOrder.id,
              productId: item.productId,
              vendorId,
              title: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
              subtotal: item.product.price * item.quantity,
              image: itemImages[0] || null,
              isEcoFriendly: item.product.isEcoFriendly,
            },
          });

          // Decrement product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        // Increment vendor successfulOrders count for Trust Score
        await tx.vendor.update({
          where: { id: vendorId },
          data: {
            successfulOrders: { increment: 1 },
            onTimeDeliveries: { increment: 1 },
          },
        });
      }

      // Create Payment record
      await tx.payment.create({
        data: {
          orderId: newMasterOrder.id,
          amount: totalAmount,
          provider: paymentMethod,
          transactionId: `TXN-${newMasterOrder.orderNumber}`,
          status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
        },
      });

      // Clear customer cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newMasterOrder;
    });

    // Fetch the created full order to return
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        vendorOrders: {
          include: {
            vendor: true,
            orderItems: true,
          },
        },
        address: true,
        payment: true,
      },
    });

    return sendSuccess(res, completeOrder, 'Order placed successfully!', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getCustomerOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        vendorOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                slug: true,
                trustScore: true,
              },
            },
            orderItems: true,
          },
        },
        address: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vendorOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                slug: true,
                trustScore: true,
                logo: true,
                phone: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  select: { id: true, slug: true },
                },
              },
            },
          },
        },
        address: true,
        payment: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Role check: customer must own order, or vendor must be in order, or user is admin
    if (
      req.user.role === 'CUSTOMER' &&
      order.userId !== req.user.id
    ) {
      return sendError(res, 'Access denied', 403);
    }

    if (req.user.role === 'VENDOR') {
      const hasVendorOrder = order.vendorOrders.some((vo) => vo.vendorId === req.user!.vendorId);
      if (!hasVendorOrder) {
        return sendError(res, 'Access denied to this order', 403);
      }
    }

    return sendSuccess(res, order);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { vendorOrders: true, orderItems: true },
    });

    if (!order || (order.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      return sendError(res, 'Order not found or permission denied', 404);
    }

    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'SHIPPED') {
      return sendError(res, 'Cannot cancel an order that has already been shipped or delivered', 400);
    }

    // Cancel master order and all sub-orders
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { orderStatus: 'CANCELLED' },
      });

      await tx.vendorOrder.updateMany({
        where: { orderId: id },
        data: { status: 'CANCELLED' },
      });

      // Restore inventory
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Record cancellation for vendor trust metrics
      for (const vo of order.vendorOrders) {
        await tx.vendor.update({
          where: { id: vo.vendorId },
          data: { cancelledOrders: { increment: 1 } },
        });
      }
    });

    return sendSuccess(res, null, 'Order successfully cancelled');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
