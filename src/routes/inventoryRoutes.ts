import express from 'express';
import { inventoryController, uploadMiddleware } from '../controllers/inventory.controller';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, inventoryController.getAllInventory);
router.post('/add', protect, inventoryController.addStock);
router.post('/remove', protect, inventoryController.removeStock);
router.get('/history/:medicineId', protect, inventoryController.getHistory);
router.post('/bulk', protect, uploadMiddleware, inventoryController.bulkAddStock);

export default router;
