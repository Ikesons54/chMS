"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const attendanceController_1 = require("../controllers/attendanceController");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Record attendance for an event
router.post('/', attendanceController_1.recordAttendance);
// Get attendance records for a specific event
router.get('/:eventId', attendanceController_1.getAttendanceByEvent);
exports.default = router;
