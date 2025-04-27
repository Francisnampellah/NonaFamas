import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} from '../controllers/unitController.js';

const router = Router();

router.use(protect as any);
router.post('/', createUnit as any);
router.get('/', getUnits as any);
router.get('/:id', getUnitById as any);
router.put('/:id', updateUnit as any);
router.delete('/:id', deleteUnit as any);

export default router; 