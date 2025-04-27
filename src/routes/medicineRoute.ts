import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';

const router = Router();

router.use(protect as any);
router.post('/', createMedicine as any);
router.get('/', getMedicines as any);
router.get('/:id', getMedicineById as any);
router.put('/:id', updateMedicine as any);
router.delete('/:id', deleteMedicine as any);

export default router; 