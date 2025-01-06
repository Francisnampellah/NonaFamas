import express from 'express';
import {
  createAuditLog,
  getAuditLogs,
  getAuditLogsByUser
} from '../controllers/auditLog.controller.js';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

// Base routes
router.route('/')
  .post(createAuditLog)
  .get(getAuditLogs);

// User specific audit logs
router.route('/user/:userId')
  .get(getAuditLogsByUser);

export default router;
