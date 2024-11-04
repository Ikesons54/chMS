"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const userValidation_1 = require("../validations/userValidation");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
router.get('/profile', userController_1.getProfile);
router.patch('/profile', (0, validateRequest_1.validateRequest)(userValidation_1.userValidation.updateProfile), userController_1.updateProfile);
router.post('/profile/picture', uploadMiddleware_1.upload.single('profilePicture'), userController_1.uploadProfilePicture);
router.delete('/account', (0, validateRequest_1.validateRequest)(userValidation_1.userValidation.deleteAccount), userController_1.deleteAccount);
exports.default = router;
