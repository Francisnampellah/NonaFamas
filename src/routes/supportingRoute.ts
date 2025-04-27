import { Router } from 'express';
import {
  createManufacturer,
  getManufacturers,
  createUnit,
  getUnits,
  createCategory,
  getCategories,
  createSupplier,
  getSuppliers,
} from '../controllers/supportingController.js';

const router = Router();

// Manufacturer routes
router.post('/manufacturers', createManufacturer);
router.get('/manufacturers', getManufacturers);

// Unit routes
router.post('/units', createUnit);
router.get('/units', getUnits);

// Category routes
router.post('/categories', createCategory);
router.get('/categories', getCategories);

// Supplier routes
router.post('/suppliers', createSupplier);
router.get('/suppliers', getSuppliers);

export default router; 