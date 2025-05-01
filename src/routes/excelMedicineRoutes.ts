import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMedicineTemplate,
  bulkUploadMedicines,
} from '../controllers/medicineController.js';
import multer from 'multer';


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});


const router = Router();

router.use(protect as any);

router.get('/medicine', getMedicineTemplate as any);
router.post('/bulk-upload/medicine', upload.single('file'), bulkUploadMedicines as any);

export default router;
