import express from 'express';
import { createSale, getSales, getSaleById } from '../controllers/sale.controller.js';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createSale)
  .get(getSales);

router.route('/:id')
  .get(getSaleById);

export default router;
