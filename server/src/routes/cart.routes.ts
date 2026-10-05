import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  switchCartItemVendor,
} from '../controllers/cart.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItemQuantity);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);
router.post('/switch-vendor', switchCartItemVendor);

export default router;
