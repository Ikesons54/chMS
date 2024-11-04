"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // Protect all routes
router.post('/', notificationController_1.createNotification); // Create a new notification
router.get('/', notificationController_1.getNotifications); // Get all notifications for the user
router.delete('/:id', notificationController_1.deleteNotification); // Delete a notification
router.patch('/:id/read', notificationController_1.markNotificationAsRead); // Mark a notification as read
exports.default = router;
