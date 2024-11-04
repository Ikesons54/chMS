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
exports.getAttendanceByEvent = exports.getAttendanceReport = exports.updateAttendance = exports.recordAttendance = exports.ServiceType = void 0;
const Attendance_1 = require("../models/Attendance");
const Event_1 = require("../models/Event");
const errorHandler_1 = require("../middleware/errorHandler");
var ServiceType;
(function (ServiceType) {
    ServiceType["SUNDAY_SERVICE"] = "sunday_service";
    ServiceType["MIDWEEK_SERVICE"] = "midweek_service";
    ServiceType["PRAYER_MEETING"] = "prayer_meeting";
    ServiceType["SPECIAL_SERVICE"] = "special_service";
    ServiceType["YOUTH_SERVICE"] = "youth_service";
    ServiceType["CHILDREN_SERVICE"] = "children_service";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
const recordAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId, attendees, date, serviceType, notes } = req.body;
        // Validate event exists
        const event = yield Event_1.Event.findById(eventId);
        if (!event) {
            return next(new errorHandler_1.AppError('Event not found', 404));
        }
        // Check for duplicate attendance record
        const existingRecord = yield Attendance_1.Attendance.findOne({
            eventId,
            date: new Date(date),
            serviceType
        });
        if (existingRecord) {
            return next(new errorHandler_1.AppError('Attendance already recorded for this service', 400));
        }
        // Create attendance record with categories
        const attendance = yield Attendance_1.Attendance.create({
            eventId,
            attendees,
            date,
            serviceType,
            notes,
            recordedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            categories: {
                men: attendees.filter((a) => a.gender === 'male').length,
                women: attendees.filter((a) => a.gender === 'female').length,
                children: attendees.filter((a) => a.age < 13).length,
                youth: attendees.filter((a) => a.age >= 13 && a.age <= 25).length,
                visitors: attendees.filter((a) => a.isVisitor).length
            }
        });
        res.status(201).json({
            status: 'success',
            data: { attendance }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.recordAttendance = recordAttendance;
const updateAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { attendees, notes } = req.body;
        const attendance = yield Attendance_1.Attendance.findById(id);
        if (!attendance) {
            return next(new errorHandler_1.AppError('Attendance record not found', 404));
        }
        // Update attendance with recalculated categories
        const updatedAttendance = yield Attendance_1.Attendance.findByIdAndUpdate(id, {
            attendees,
            notes,
            categories: {
                men: attendees.filter((a) => a.gender === 'male').length,
                women: attendees.filter((a) => a.gender === 'female').length,
                children: attendees.filter((a) => a.age < 13).length,
                youth: attendees.filter((a) => a.age >= 13 && a.age <= 25).length,
                visitors: attendees.filter((a) => a.isVisitor).length
            },
            lastModifiedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            lastModifiedAt: new Date()
        }, { new: true });
        res.status(200).json({
            status: 'success',
            data: { attendance: updatedAttendance }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateAttendance = updateAttendance;
const getAttendanceReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, serviceType, groupBy = 'service' } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (serviceType)
            query.serviceType = serviceType;
        const attendanceRecords = yield Attendance_1.Attendance.find(query)
            .populate('eventId')
            .populate('attendees', 'firstName lastName gender age isVisitor')
            .populate('recordedBy', 'firstName lastName')
            .sort({ date: -1 });
        const summary = {
            totalServices: attendanceRecords.length,
            averageAttendance: Math.round(attendanceRecords.reduce((sum, record) => sum + record.attendees.length, 0) /
                (attendanceRecords.length || 1)),
            highestAttendance: Math.max(...(attendanceRecords.length ?
                attendanceRecords.map((record) => record.attendees.length) :
                [0])),
            byCategory: {
                men: attendanceRecords.reduce((sum, record) => sum + record.categories.men, 0),
                women: attendanceRecords.reduce((sum, record) => sum + record.categories.women, 0),
                children: attendanceRecords.reduce((sum, record) => sum + record.categories.children, 0),
                youth: attendanceRecords.reduce((sum, record) => sum + record.categories.youth, 0),
                visitors: attendanceRecords.reduce((sum, record) => sum + record.categories.visitors, 0)
            },
            byServiceType: Object.values(ServiceType).reduce((acc, type) => {
                const serviceRecords = attendanceRecords.filter((r) => r.serviceType === type);
                acc[type] = {
                    count: serviceRecords.length,
                    totalAttendance: serviceRecords.reduce((sum, r) => sum + r.attendees.length, 0),
                    averageAttendance: Math.round(serviceRecords.reduce((sum, r) => sum + r.attendees.length, 0) /
                        (serviceRecords.length || 1))
                };
                return acc;
            }, {})
        };
        res.status(200).json({
            status: 'success',
            data: {
                records: attendanceRecords,
                summary
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAttendanceReport = getAttendanceReport;
const getAttendanceByEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const attendanceRecords = yield Attendance_1.Attendance.find({ eventId })
            .populate('attendees', 'firstName lastName gender age isVisitor')
            .sort({ date: -1 });
        res.status(200).json({
            status: 'success',
            data: { attendanceRecords }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAttendanceByEvent = getAttendanceByEvent;
