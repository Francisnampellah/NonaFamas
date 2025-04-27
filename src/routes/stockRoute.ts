import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStock,
  getStockByMedicineId,
  updateStock,
  adjustStock,
} from '../controllers/stockController.js';

const router = Router();

router.use(protect as any);
router.get('/', getStock as any);
router.get('/medicine/:medicineId', getStockByMedicineId as any);
router.put('/medicine/:medicineId', updateStock as any);
router.patch('/medicine/:medicineId/adjust', adjustStock as any);

export default router; 