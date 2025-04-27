import { Router } from 'express';
import {
  createManufacturer,
  getManufacturers,
  getManufacturerById,
  updateManufacturer,
  deleteManufacturer,
} from '../controllers/manufacturerController.js';

const router = Router();

router.post('/', createManufacturer);
router.get('/', getManufacturers);
router.get('/:id', getManufacturerById as any);
router.put('/:id', updateManufacturer);
router.delete('/:id', deleteManufacturer);

export default router; 