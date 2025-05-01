import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStockUpdateTemplate,
  bulkUpdateStock,
} from '../controllers/stockController.js';
import multer from 'multer';


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});


const router = Router();

router.use(protect as any);

router.get('/stock', getStockUpdateTemplate as any);
router.post('/bulk-upload/stock', upload.single('file'), bulkUpdateStock as any);

export default router;
