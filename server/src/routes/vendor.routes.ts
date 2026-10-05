import { Router } from 'express';
import {
  getPublicVendors,
  getVendorBySlug,
  getVendorAnalytics,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  updateVendorOrderStatus,
} from '../controllers/vendor.controller.js';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public vendor routes
router.get('/', getPublicVendors);
router.get('/:slug', getVendorBySlug);

// Private Vendor routes (strictly protected for VENDOR role)
router.use('/dashboard', authenticateUser, requireRole('VENDOR'));
router.get('/dashboard/analytics', getVendorAnalytics);
router.get('/dashboard/products', getVendorProducts);
router.post('/dashboard/products', createVendorProduct);
router.put('/dashboard/products/:id', updateVendorProduct);
router.delete('/dashboard/products/:id', deleteVendorProduct);
router.get('/dashboard/orders', getVendorOrders);
router.put('/dashboard/orders/:id/status', updateVendorOrderStatus);

export default router;
