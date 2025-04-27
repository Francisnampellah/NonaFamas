import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';

const router = Router();

router.use(protect as any);
router.post('/', createSupplier as any);
router.get('/', getSuppliers as any);
router.get('/:id', getSupplierById as any);
router.put('/:id', updateSupplier as any);
router.delete('/:id', deleteSupplier as any);

export default router; 