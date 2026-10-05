import { Router } from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/address.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;
