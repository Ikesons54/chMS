import express from 'express';
import { schedulerService } from '../services/schedulerService';
import { authenticate } from '../middleware/auth';
import { validateSchedule } from '../middleware/validation';
import { logger } from '../utils/logger';
import { Schedule } from '../models/Schedule';

const router = express.Router();

// Create a new schedule
router.post('/', authenticate, validateSchedule, async (req, res) => {
  try {
    const schedule = await schedulerService.createSchedule(req.body);
    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create schedule'
    });
  }
});

// Get all schedules
router.get('/', authenticate, async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('recipients', 'email firstName lastName')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    logger.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schedules'
    });
  }
});

// Get a specific schedule
router.get('/:id', authenticate, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('recipients', 'email firstName lastName');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schedule'
    });
  }
});

// Update a schedule
router.put('/:id', authenticate, validateSchedule, async (req, res) => {
  try {
    const schedule = await schedulerService.updateSchedule(req.params.id, req.body);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update schedule'
    });
  }
});

// Delete a schedule
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await schedulerService.deleteSchedule(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete schedule'
    });
  }
});

export default router;