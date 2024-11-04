import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { hasPermission } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createAnnouncement } from '../controllers/announcementController';
import { announcementValidation } from '../validations/announcementValidation';
import { Permission } from '../models/User';

const router = express.Router();

router.post(
  '/announcements',
  protect,
  hasPermission(Permission.MANAGE_ANNOUNCEMENTS),
  validateRequest(announcementValidation.create),
  createAnnouncement
);

export default router;