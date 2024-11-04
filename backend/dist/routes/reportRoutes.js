"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const titheReportController_1 = require("../controllers/titheReportController");
const scheduleController_1 = require("../controllers/scheduleController");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS));
// Report routes
router.get('/individual-trends', titheReportController_1.getIndividualTitherTrends);
router.get('/custom-range', titheReportController_1.getCustomDateRangeReport);
router.get('/export', titheReportController_1.exportToExcel);
// Schedule routes
router.post('/schedules', scheduleController_1.createSchedule);
router.get('/schedules', scheduleController_1.getSchedules);
router.patch('/schedules/:id', scheduleController_1.updateSchedule);
router.delete('/schedules/:id', scheduleController_1.deleteSchedule);
exports.default = router;
