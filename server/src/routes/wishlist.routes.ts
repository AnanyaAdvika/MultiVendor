import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
