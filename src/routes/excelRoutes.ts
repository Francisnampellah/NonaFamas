import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMedicineTemplate,
} from '../controllers/medicineController.js';

const router = Router();

router.use(protect as any);

router.get('/medicine', getMedicineTemplate as any);

export default router;
