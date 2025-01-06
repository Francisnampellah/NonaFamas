import express from 'express';
import { medicineController } from '../controllers/medicine.controller';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, medicineController.getAll);
router.post('/', protect, medicineController.create);
router.put('/:id', protect, medicineController.update);
router.delete('/:id', protect, medicineController.delete);
router.get('/:id', protect, medicineController.getOne);

export default router;
