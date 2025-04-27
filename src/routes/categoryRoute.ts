import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.use(protect as any);
router.post('/', createCategory as any);
router.get('/', getCategories as any);
router.get('/:id', getCategoryById as any);
router.put('/:id', updateCategory as any);
router.delete('/:id', deleteCategory as any);

export default router; 