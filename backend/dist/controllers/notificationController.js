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
exports.markNotificationAsRead = exports.deleteNotification = exports.getNotifications = exports.createNotification = void 0;
const Notification_1 = require("../models/Notification");
const errorHandler_1 = require("../middleware/errorHandler");
const createNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, message, recipient } = req.body;
        const notification = yield Notification_1.Notification.create({
            title,
            message,
            recipient
        });
        res.status(201).json({
            status: 'success',
            data: { notification }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNotification = createNotification;
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notifications = yield Notification_1.Notification.find({ recipient: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            data: { notifications }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotifications = getNotifications;
const deleteNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const notification = yield Notification_1.Notification.findByIdAndDelete(id);
        if (!notification) {
            return next(new errorHandler_1.AppError('Notification not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteNotification = deleteNotification;
const markNotificationAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const notification = yield Notification_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!notification) {
            return next(new errorHandler_1.AppError('Notification not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
