import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { hasPermission } from '../middleware/roleMiddleware';
import {
  recordDonation,
  getDonationReceipt,
  getDonationsByType,
  getDonorHistory,
  getTitheReport
} from '../controllers/donationController';
import { validateRequest } from '../middleware/validateRequest';
import { donationValidation } from '../validations/donationValidation';
import { Permission } from '../models/User';

const router = express.Router();

// Protect all routes
router.use(protect);

// Record donation (Finance team only)
router.post(
  '/',
  hasPermission(Permission.MANAGE_DONATIONS),
  validateRequest(donationValidation.create),
  recordDonation
);

// Get receipt
router.get('/receipt/:receiptNumber', getDonationReceipt);

// Get donations by type (Finance team only)
router.get(
  '/by-type',
  hasPermission(Permission.MANAGE_DONATIONS),
  getDonationsByType
);

// Get donor history
router.get('/donor/:donorId', getDonorHistory);

// Get tithe report
router.get(
  '/tithes',
  hasPermission(Permission.MANAGE_DONATIONS),
  getTitheReport
);

export default router; 