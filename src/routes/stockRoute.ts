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
router.put('/:medicineId', updateStock as any);
router.patch('/:medicineId', adjustStock as any);

export default router; 