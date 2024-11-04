"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.updateUserRole = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const emailService_1 = require("../services/emailService");
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        // Validate role
        if (!Object.values(User_1.UserRole).includes(role)) {
            return next(new errorHandler_1.AppError('Invalid role', 400));
        }
        // Find user and update role
        const user = yield User_1.User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        // Send email notification with correct EmailOptions interface
        yield emailService_1.emailService.sendEmail({
            to: user.email,
            subject: 'Role Update',
            template: 'roleUpdate',
            data: {
                name: user.firstName,
                newRole: role,
                type: 'roleUpdate'
            }
        });
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserRole = updateUserRole;
const getUsersByRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.params;
        // Validate role
        if (!Object.values(User_1.UserRole).includes(role)) {
            return next(new errorHandler_1.AppError('Invalid role', 400));
        }
        const users = yield User_1.User.find({ role }).select('-password');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUsersByRole = getUsersByRole;
