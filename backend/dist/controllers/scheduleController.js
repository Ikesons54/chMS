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
exports.deleteSchedule = exports.updateSchedule = exports.getSchedules = exports.createSchedule = void 0;
const Schedule_1 = require("../models/Schedule");
const errorHandler_1 = require("../middleware/errorHandler");
const createSchedule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const schedule = yield Schedule_1.Schedule.create(Object.assign(Object.assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
        res.status(201).json({
            status: 'success',
            data: { schedule }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createSchedule = createSchedule;
const getSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedules = yield Schedule_1.Schedule.find()
            .populate('createdBy', 'firstName lastName');
        res.status(200).json({
            status: 'success',
            data: { schedules }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSchedules = getSchedules;
const updateSchedule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedule = yield Schedule_1.Schedule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!schedule) {
            return next(new errorHandler_1.AppError('Schedule not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { schedule }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSchedule = updateSchedule;
const deleteSchedule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedule = yield Schedule_1.Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return next(new errorHandler_1.AppError('Schedule not found', 404));
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
exports.deleteSchedule = deleteSchedule;
