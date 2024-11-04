import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createNotification, getNotifications, deleteNotification, markNotificationAsRead } from '../controllers/notificationController';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/', createNotification); // Create a new notification
router.get('/', getNotifications); // Get all notifications for the user
router.delete('/:id', deleteNotification); // Delete a notification
router.patch('/:id/read', markNotificationAsRead); // Mark a notification as read

export default router; 