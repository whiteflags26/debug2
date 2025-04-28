import express from 'express';
import { protect, checkPermission } from '../auth/auth.middleware';
import { getAdminLogs, getEntityLogs, getUserLogs } from './adminActions.controller';


const router = express.Router();

// Log viewing routes
router.get(
  '/',
  protect,
  checkPermission('view_admin_logs'),
  getAdminLogs
  
  
);

router.get(
  '/user/:userId',
  protect,
  checkPermission('view_admin_logs'),
  getUserLogs
);

router.get(
  '/entity/:entityType/:entityId',
  protect,
  checkPermission('view_admin_logs'),
  getEntityLogs
);

export default router;