import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  

} from '../controllers/transaction.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect as any as any);

// Create a new transaction
router.post('/', createTransaction as any);

// Get all transactions with optional filters
router.get('/', getTransactions as any);

// Get a specific transaction by ID
router.get('/:id', getTransactionById as any);

export default router; 