"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const titheReportController_1 = require("../controllers/titheReportController");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS));
router.get('/annual-summary', titheReportController_1.getAnnualTitheSummaryReport);
router.get('/tither-analytics', titheReportController_1.getTitherAnalyticsReport);
exports.default = router;
