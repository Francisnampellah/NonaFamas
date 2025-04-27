import { Router } from 'express';
import {
  getStock,
  getStockByMedicineId,
  updateStock,
  adjustStock,
} from '../controllers/stockController.js';

const router = Router();

router.get('/', getStock as any);
router.get('/medicine/:medicineId', getStockByMedicineId as any);
router.put('/medicine/:medicineId', updateStock as any);
router.patch('/medicine/:medicineId/adjust', adjustStock as any);

export default router; 