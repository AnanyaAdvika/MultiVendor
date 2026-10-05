import { Router } from 'express';
import { getBestDealsOverview } from '../controllers/deal.controller.js';

const router = Router();

router.get('/best-deals', getBestDealsOverview);

export default router;
