import { Router } from 'express';
import authRoutes from './authRoute.js';
import medicineRoutes from './medicineRoute.js';
import purchaseRoutes from './purchaseRoute.js';
import manufacturerRoutes from './manufacturerRoute.js';
import unitRoutes from './unitRoute.js';
import categoryRoutes from './categoryRoute.js';
import supplierRoutes from './supplierRoute.js';
import stockRoutes from './stockRoute.js';
import sellRoutes from './sell.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/manufacturers', manufacturerRoutes);
router.use('/units', unitRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/stock', stockRoutes);
router.use('/sells', sellRoutes);

export default router; 