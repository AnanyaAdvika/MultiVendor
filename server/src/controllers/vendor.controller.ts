import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { calculateTrustScore, recalculateVendorTrust } from '../services/trustScore.service.js';

export async function getPublicVendors(req: Request, res: Response) {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'APPROVED' },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { trustScore: 'desc' },
    });

    const formatted = vendors.map((v) => ({
      ...v,
      trustMetrics: calculateTrustScore(v),
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getVendorBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { category: true },
        },
      },
    });

    if (!vendor) return sendError(res, 'Vendor not found', 404);

    const formattedProducts = vendor.products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));

    return sendSuccess(res, {
      ...vendor,
      products: formattedProducts,
      trustMetrics: calculateTrustScore(vendor),
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

// =================== VENDOR PRIVATE DASHBOARD APIS ===================

export async function getVendorAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const vendorId = req.user.vendorId;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) return sendError(res, 'Vendor not found', 404);

    const [productsCount, vendorOrders, lowStockProducts] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.vendorOrder.findMany({
        where: { vendorId },
        include: {
          orderItems: true,
          order: {
            select: { orderNumber: true, createdAt: true, paymentStatus: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { vendorId, stock: { lte: 5 } },
        select: { id: true, title: true, stock: true, price: true },
        take: 5,
      }),
    ]);

    // Financial metrics
    const totalRevenue = vendorOrders
      .filter((vo) => vo.status !== 'CANCELLED')
      .reduce((sum, vo) => sum + vo.vendorEarnings, 0);

    const pendingOrdersCount = vendorOrders.filter((vo) => vo.status === 'PENDING').length;
    const shippedOrdersCount = vendorOrders.filter((vo) => vo.status === 'SHIPPED').length;
    const deliveredOrdersCount = vendorOrders.filter((vo) => vo.status === 'DELIVERED').length;

    // Trust score metrics
    const trustMetrics = calculateTrustScore(vendor);

    return sendSuccess(res, {
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        slug: vendor.slug,
        status: vendor.status,
        trustScore: vendor.trustScore,
        trustMetrics,
      },
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: vendorOrders.length,
        pendingOrders: pendingOrdersCount,
        shippedOrders: shippedOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        totalProducts: productsCount,
        lowStockAlerts: lowStockProducts.length,
      },
      recentOrders: vendorOrders.slice(0, 5),
      lowStockProducts,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getVendorProducts(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const products = await prisma.product.findMany({
      where: { vendorId: req.user.vendorId },
      include: {
        category: true,
        _count: {
          select: { reviews: true, orderItems: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createVendorProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const {
      title,
      description,
      price,
      compareAtPrice,
      discountPercent = 0,
      stock,
      categoryId,
      images = [],
      sku,
      catalogGroup,
      isEcoFriendly = false,
      ecoDetails,
      isFeatured = false,
    } = req.body;

    if (!title || !description || price === undefined || stock === undefined || !categoryId) {
      return sendError(res, 'Missing required product fields', 400);
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        vendorId: req.user.vendorId,
        categoryId,
        title,
        slug,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        discountPercent: parseFloat(discountPercent) || 0,
        stock: parseInt(stock),
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        catalogGroup: catalogGroup || null,
        isEcoFriendly: !!isEcoFriendly,
        ecoDetails: ecoDetails || null,
        isFeatured: !!isFeatured,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateVendorProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const { id } = req.params;

    // Strict ownership verification: A vendor can NEVER modify another vendor's product!
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: req.user.vendorId,
      },
    });

    if (!product) {
      return sendError(res, 'Product not found or unauthorized', 404);
    }

    const {
      title,
      description,
      price,
      compareAtPrice,
      discountPercent,
      stock,
      categoryId,
      images,
      sku,
      catalogGroup,
      isEcoFriendly,
      ecoDetails,
      isActive,
      isFeatured,
    } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (discountPercent !== undefined) data.discountPercent = parseFloat(discountPercent);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (images !== undefined) data.images = JSON.stringify(Array.isArray(images) ? images : [images]);
    if (sku !== undefined) data.sku = sku;
    if (catalogGroup !== undefined) data.catalogGroup = catalogGroup;
    if (isEcoFriendly !== undefined) data.isEcoFriendly = !!isEcoFriendly;
    if (ecoDetails !== undefined) data.ecoDetails = ecoDetails;
    if (isActive !== undefined) data.isActive = !!isActive;
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteVendorProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const { id } = req.params;

    // Strict ownership check
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: req.user.vendorId,
      },
    });

    if (!product) {
      return sendError(res, 'Product not found or unauthorized', 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getVendorOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    // Strict filter: View ONLY their own vendor orders!
    const vendorOrders = await prisma.vendorOrder.findMany({
      where: { vendorId: req.user.vendorId },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            paymentStatus: true,
            paymentMethod: true,
            address: true,
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, vendorOrders);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateVendorOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.vendorId) return sendError(res, 'Vendor account required', 403);

    const { id } = req.params; // VendorOrderId
    const { status, trackingNumber, shippingCarrier } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of [${validStatuses.join(', ')}]`, 400);
    }

    // Verify ownership
    const vendorOrder = await prisma.vendorOrder.findFirst({
      where: {
        id,
        vendorId: req.user.vendorId,
      },
      include: { order: true },
    });

    if (!vendorOrder) {
      return sendError(res, 'Vendor sub-order not found or unauthorized', 404);
    }

    const data: any = { status };
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (shippingCarrier !== undefined) data.shippingCarrier = shippingCarrier;

    if (status === 'SHIPPED') data.shippedAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();

    const updated = await prisma.vendorOrder.update({
      where: { id },
      data,
    });

    // Check if all sub-orders of master order are delivered or shipped to update master orderStatus
    const allSubOrders = await prisma.vendorOrder.findMany({
      where: { orderId: vendorOrder.orderId },
    });

    const allDelivered = allSubOrders.every((so) => so.status === 'DELIVERED');
    const allShipped = allSubOrders.every((so) => so.status === 'SHIPPED' || so.status === 'DELIVERED');
    const anyShipped = allSubOrders.some((so) => so.status === 'SHIPPED' || so.status === 'DELIVERED');

    let newMasterStatus = vendorOrder.order.orderStatus;
    if (allDelivered) newMasterStatus = 'DELIVERED';
    else if (allShipped) newMasterStatus = 'SHIPPED';
    else if (anyShipped) newMasterStatus = 'PARTIALLY_SHIPPED';

    if (newMasterStatus !== vendorOrder.order.orderStatus) {
      await prisma.order.update({
        where: { id: vendorOrder.orderId },
        data: { orderStatus: newMasterStatus },
      });
    }

    // Recalculate vendor trust score
    await recalculateVendorTrust(req.user.vendorId);

    return sendSuccess(res, updated, 'Order status updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
