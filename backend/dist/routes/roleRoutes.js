"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const User_1 = require("../models/User");
const validateRequest_1 = require("../middleware/validateRequest");
const roleValidation_1 = require("../validations/roleValidation");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Only admin can manage roles
router.use((0, roleMiddleware_1.hasRole)([User_1.UserRole.ADMIN]));
router.patch('/update-role', (0, validateRequest_1.validateRequest)(roleValidation_1.roleValidation.updateRole), roleController_1.updateUserRole);
router.get('/users/:role', roleController_1.getUsersByRole);
exports.default = router;
