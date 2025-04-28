import express from 'express';
import { protect } from '../auth/auth.middleware';
import {
  getAllPermissions,
  getGlobalPermissions,
  getLocalPermissions,
} from './permission.controller';

const router = express.Router();

router.use(protect);

// Get all permissions
router.get('/', getAllPermissions);

// Get global permissions
router.get('/global', getGlobalPermissions);

// Get local (organization) permissions
router.get('/local', getLocalPermissions);

export default router;
