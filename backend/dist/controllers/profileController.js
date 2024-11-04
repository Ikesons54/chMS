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
exports.updateProfile = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user; // Ensure req.user is defined and cast it to IUser
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        const updates = req.body;
        const updatedUser = yield User_1.User.findByIdAndUpdate(user._id, updates, { new: true });
        if (!updatedUser) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
