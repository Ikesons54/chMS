"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const announcementController_1 = require("../controllers/announcementController");
const announcementValidation_1 = require("../validations/announcementValidation");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/announcements', authMiddleware_1.protect, (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_ANNOUNCEMENTS), (0, validateRequest_1.validateRequest)(announcementValidation_1.announcementValidation.create), announcementController_1.createAnnouncement);
exports.default = router;
