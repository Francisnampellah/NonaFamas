import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createBatch, getBatchSummary, deleteBatch, getBatchById, getBatches, updateBatch } from '../controllers/batchController.js';

const router = Router();

router.use(protect as any); 

// Create a new batch
router.post('/', createBatch as any);

// Get all batches with optional date filtering
router.get('/', getBatches as any);

// Get a specific batch by ID
router.get('/:id', getBatchById as any);

// Update a batch
router.put('/:id', updateBatch as any);

// Delete a batch
router.delete('/:id', deleteBatch as any);

// Get batch summary
router.get('/:id/summary', getBatchSummary as any);

export default router; 