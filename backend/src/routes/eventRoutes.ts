import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new event
router.post('/', createEvent);

// Get all events
router.get('/', getEvents);

// Update an event by ID
router.patch('/:eventId', updateEvent);

// Delete an event by ID
router.delete('/:eventId', deleteEvent);

export default router; 