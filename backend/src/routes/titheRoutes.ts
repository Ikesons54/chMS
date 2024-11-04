import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { hasPermission } from '../middleware/roleMiddleware';
import {
  getTitheDashboard,
  getTitheStatement,
  getTitheAnalytics
} from '../controllers/titheController';
import { Permission } from '../models/User'; // Import Permission enum

const router = express.Router();

// Protect all routes
router.use(protect);

// Get tithe dashboard (Finance team only)
router.get(
  '/dashboard',
  hasPermission(Permission.MANAGE_DONATIONS), // Use the Permission enum
  getTitheDashboard
);

// Get tithe statement
router.get(
  '/statement',
  hasPermission(Permission.MANAGE_DONATIONS), // Use the Permission enum
  getTitheStatement
);

// Get tithe analytics
router.get(
  '/analytics',
  hasPermission(Permission.MANAGE_DONATIONS), // Use the Permission enum
  getTitheAnalytics
);

export default router; 