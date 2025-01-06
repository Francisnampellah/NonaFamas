import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionsBySale
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTransaction)
  .get(getAllTransactions);

router.route('/sale/:saleId')
  .get(getTransactionsBySale);

export default router;
