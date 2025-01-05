import express from 'express';
import inventoryController from '../controllers/inventoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, inventoryController.getAllInventory);
router.post('/', protect, inventoryController.addInventoryItem);
router.put('/:id', protect, inventoryController.updateInventoryItem);

export default router;
