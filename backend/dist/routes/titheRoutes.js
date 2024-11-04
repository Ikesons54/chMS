"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const titheController_1 = require("../controllers/titheController");
const User_1 = require("../models/User"); // Import Permission enum
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Get tithe dashboard (Finance team only)
router.get('/dashboard', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), // Use the Permission enum
titheController_1.getTitheDashboard);
// Get tithe statement
router.get('/statement', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), // Use the Permission enum
titheController_1.getTitheStatement);
// Get tithe analytics
router.get('/analytics', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), // Use the Permission enum
titheController_1.getTitheAnalytics);
exports.default = router;
