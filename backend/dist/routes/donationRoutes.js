"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const donationController_1 = require("../controllers/donationController");
const validateRequest_1 = require("../middleware/validateRequest");
const donationValidation_1 = require("../validations/donationValidation");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Record donation (Finance team only)
router.post('/', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), (0, validateRequest_1.validateRequest)(donationValidation_1.donationValidation.create), donationController_1.recordDonation);
// Get receipt
router.get('/receipt/:receiptNumber', donationController_1.getDonationReceipt);
// Get donations by type (Finance team only)
router.get('/by-type', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), donationController_1.getDonationsByType);
// Get donor history
router.get('/donor/:donorId', donationController_1.getDonorHistory);
// Get tithe report
router.get('/tithes', (0, roleMiddleware_1.hasPermission)(User_1.Permission.MANAGE_DONATIONS), donationController_1.getTitheReport);
exports.default = router;
