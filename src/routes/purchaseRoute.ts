import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getPurchasesByMedicine,
} from '../controllers/purchaseController.js';

const router = Router();

router.use(protect as any);
router.post('/', createPurchase as any);
router.get('/', getPurchases as any);
router.get('/:id', getPurchaseById as any);
router.get('/medicine/:medicineId', getPurchasesByMedicine as any);

export default router; 