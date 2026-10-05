import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductBySlugOrId,
  getProductDeals,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/deals/:id', getProductDeals);
router.get('/:identifier', getProductBySlugOrId);

export default router;
