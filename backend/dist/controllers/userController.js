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
exports.deleteAccount = exports.uploadProfilePicture = exports.updateProfile = exports.getProfile = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const cloudinary_1 = require("../utils/cloudinary");
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { firstName, lastName, phoneNumber } = req.body;
        // Find user and update
        const user = yield User_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
            firstName,
            lastName,
            phoneNumber,
        }, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
const uploadProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!req.file) {
            return next(new errorHandler_1.AppError('Please upload a file', 400));
        }
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        // If user already has a profile picture, delete it from cloudinary
        if (user.profilePicture) {
            const publicId = (_b = user.profilePicture.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield (0, cloudinary_1.removeFromCloudinary)(publicId);
            }
        }
        // Upload new profile picture to cloudinary
        const result = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path);
        // Update user's profile picture
        user.profilePicture = result.secure_url;
        yield user.save();
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
const deleteAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { password } = req.body;
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('+password');
        if (!user || !(yield user.comparePassword(password))) {
            return next(new errorHandler_1.AppError('Incorrect password', 401));
        }
        // If user has a profile picture, delete it from cloudinary
        if (user.profilePicture) {
            const publicId = (_b = user.profilePicture.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield (0, cloudinary_1.removeFromCloudinary)(publicId);
            }
        }
        // Delete user
        yield User_1.User.findByIdAndDelete(user._id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteAccount = deleteAccount;
