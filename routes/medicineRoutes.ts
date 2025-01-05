import express from 'express';
import medicineController from '../controllers/medicineController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, medicineController.getAllMedicines);
router.post('/', protect, medicineController.createMedicine);
router.put('/:id', protect, medicineController.updateMedicine);

export default router;
