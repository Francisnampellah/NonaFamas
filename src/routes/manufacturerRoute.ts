import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createManufacturer,
  getManufacturers,
  getManufacturerById,
  updateManufacturer,
  deleteManufacturer,
} from '../controllers/manufacturerController.js';

const router = Router();

router.use(protect as any);
router.post('/', createManufacturer as any);
router.get('/', getManufacturers as any);
router.get('/:id', getManufacturerById as any);
router.put('/:id', updateManufacturer as any);
router.delete('/:id', deleteManufacturer as any);

export default router; 