import { Router } from 'express';
import {  getSells, getSellById, createSell } from '../controllers/sell.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All sell routes require authentication
router.use(protect as any);

// Create a new sell
router.post('/', createSell as any);

// Get all sells with optional filters
router.get('/', getSells as any);

// Get a specific sell by ID
router.get('/:id', getSellById as any);

export default router; 