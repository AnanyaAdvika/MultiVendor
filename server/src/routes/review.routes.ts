import { Router } from 'express';
import { addReview, getProductReviews } from '../controllers/review.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticateUser, addReview);

export default router;
