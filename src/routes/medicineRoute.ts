import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineTemplate,
} from '../controllers/medicineController.js';

const router = Router();

router.use(protect as any);
router.post('/', createMedicine as any);
router.get('/', getMedicines as any);
router.get('/:id', getMedicineById as any);
router.put('/:id', updateMedicine as any);
router.delete('/:id', deleteMedicine as any);
router.get('/template', getMedicineTemplate as any);

export default router; 