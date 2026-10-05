import { Router } from 'express';
import {
  getAdminAnalytics,
  getAllVendors,
  updateVendorStatus,
  getAllCustomers,
  toggleCustomerStatus,
  getAllOrders,
  getAllReviews,
  deleteReview,
  createCategory,
} from '../controllers/admin.controller.js';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser, requireRole('ADMIN'));

router.get('/analytics', getAdminAnalytics);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/status', toggleCustomerStatus);
router.get('/orders', getAllOrders);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);
router.post('/categories', createCategory);

export default router;
