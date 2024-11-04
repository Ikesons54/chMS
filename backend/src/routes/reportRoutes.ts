import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { hasPermission } from '../middleware/roleMiddleware';
import {
  getIndividualTitherTrends,
  getCustomDateRangeReport,
  exportToExcel
} from '../controllers/titheReportController';
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedules
} from '../controllers/scheduleController';
import { Permission } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(hasPermission(Permission.MANAGE_DONATIONS));

// Report routes
router.get('/individual-trends', getIndividualTitherTrends);
router.get('/custom-range', getCustomDateRangeReport);
router.get('/export', exportToExcel);

// Schedule routes
router.post('/schedules', createSchedule);
router.get('/schedules', getSchedules);
router.patch('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

export default router; 