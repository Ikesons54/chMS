import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { hasPermission } from '../middleware/roleMiddleware';
import {
  getAnnualTitheSummaryReport,
  getTitherAnalyticsReport
} from '../controllers/titheReportController';
import { Permission } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(hasPermission(Permission.MANAGE_DONATIONS));

router.get('/annual-summary', getAnnualTitheSummaryReport);
router.get('/tither-analytics', getTitherAnalyticsReport);

export default router; 