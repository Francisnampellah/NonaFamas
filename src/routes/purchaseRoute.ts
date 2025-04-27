import { Router } from 'express';
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getPurchasesByMedicine,
} from '../controllers/purchaseController.js';

const router = Router();

router.post('/', createPurchase);
router.get('/', getPurchases);
router.get('/:id', getPurchaseById as any);
router.get('/medicine/:medicineId', getPurchasesByMedicine);

export default router; 