import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  recordAttendance, 
  getAttendanceByEvent,
  updateAttendance 
} from '../controllers/attendanceController';

const router = express.Router();

// Protected routes
router.use(protect);

// Record attendance
router.post('/', recordAttendance);

// Get attendance by event
router.get('/event/:eventId', getAttendanceByEvent);

// Update attendance
router.patch('/:id', updateAttendance);

export default router; 