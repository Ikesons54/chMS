"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const authValidation_1 = require("../validations/authValidation");
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, validateRequest_1.validateRequest)(authValidation_1.authValidation.register), authController_1.register);
router.post('/login', (0, validateRequest_1.validateRequest)(authValidation_1.authValidation.login), authController_1.login);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.post('/forgot-password', (0, validateRequest_1.validateRequest)(authValidation_1.authValidation.forgotPassword), authController_1.forgotPassword);
router.post('/reset-password/:token', (0, validateRequest_1.validateRequest)(authValidation_1.authValidation.resetPassword), authController_1.resetPassword);
router.post('/refresh-token', authController_1.refreshToken);
// Protected routes
router.use(authMiddleware_1.protect); // Apply authentication middleware to all routes below
router.post('/update-password', (0, validateRequest_1.validateRequest)(authValidation_1.authValidation.updatePassword), authController_1.updatePassword);
router.post('/logout', authController_1.logout);
exports.default = router;
