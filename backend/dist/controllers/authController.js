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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updatePassword = exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("../services/emailService");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, role = 'member' } = req.body;
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.AppError('Email already exists', 400));
        }
        const user = yield User_1.User.create({
            email,
            password,
            firstName,
            lastName,
            role
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email }).select('+password');
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return next(new errorHandler_1.AppError('Invalid email or password', 401));
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = yield User_1.User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(new errorHandler_1.AppError('Token is invalid or has expired', 400));
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        yield user.save();
        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return next(new errorHandler_1.AppError('No user found with this email address', 404));
        }
        const resetToken = user.createPasswordResetToken();
        yield user.save({ validateBeforeSave: false });
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        yield emailService_1.emailService.sendEmail({
            to: user.email,
            subject: 'Password Reset',
            template: 'passwordReset',
            data: {
                type: 'passwordReset',
                name: user.firstName,
                resetURL
            }
        });
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to email'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = yield User_1.User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(new errorHandler_1.AppError('Token is invalid or has expired', 400));
        }
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save();
        const jwtToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(200).json({
            status: 'success',
            token: jwtToken
        });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new errorHandler_1.AppError('Refresh token is required', 400));
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield User_1.User.findById(decoded.id);
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
        res.status(200).json({
            status: 'success',
            token,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Type check for user
        if (!req.user || !req.user._id) {
            throw new Error('User not authenticated');
        }
        // Get user from collection
        const user = yield User_1.User.findById(req.user._id).select('+password');
        if (!user) {
            throw new Error('User not found');
        }
        // Check if posted current password is correct
        if (!(yield user.comparePassword(req.body.currentPassword))) {
            throw new Error('Your current password is wrong');
        }
        // If so, update password
        user.password = req.body.password;
        yield user.save();
        // Log the password change
        yield user.logActivity({
            action: 'PASSWORD_CHANGE',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePassword = updatePassword;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If using refresh tokens, invalidate them here
        // For JWT, client-side deletion is sufficient
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
