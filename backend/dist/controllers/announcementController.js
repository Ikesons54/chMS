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
exports.getAnnouncements = exports.createAnnouncement = void 0;
const Announcement_1 = require("../models/Announcement");
const createAnnouncement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, startDate, endDate, priority } = req.body;
        const announcement = yield Announcement_1.Announcement.create({
            title,
            content,
            startDate,
            endDate,
            priority,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        res.status(201).json({
            status: 'success',
            data: { announcement }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createAnnouncement = createAnnouncement;
const getAnnouncements = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const announcements = yield Announcement_1.Announcement.find({
            endDate: { $gte: new Date() }
        }).sort({ priority: -1, startDate: 1 });
        res.status(200).json({
            status: 'success',
            data: { announcements }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAnnouncements = getAnnouncements;
