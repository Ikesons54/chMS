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
exports.getChurchOverview = void 0;
const Donation_1 = require("../models/Donation");
const Attendance_1 = require("../models/Attendance");
const Event_1 = require("../models/Event");
const getChurchOverview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Get donations summary
        const donations = yield Donation_1.Donation.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });
        // Get attendance summary
        const attendance = yield Attendance_1.Attendance.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });
        // Get ministry activities with proper typing
        const ministryEvents = yield Event_1.Event.find({
            startDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('ministry');
        const report = {
            donations: {
                total: donations.reduce((sum, d) => sum + d.amount, 0),
                count: donations.length,
                byType: donations.reduce((acc, d) => {
                    acc[d.type] = (acc[d.type] || 0) + d.amount;
                    return acc;
                }, {})
            },
            attendance: {
                averageAttendance: Math.round(attendance.reduce((sum, a) => sum + a.attendees.length, 0) /
                    (attendance.length || 1)),
                totalServices: attendance.length,
                byService: attendance.reduce((acc, a) => {
                    acc[a.serviceType] = (acc[a.serviceType] || 0) + a.attendees.length;
                    return acc;
                }, {})
            },
            ministries: {
                totalEvents: ministryEvents.length,
                byMinistry: ministryEvents.reduce((acc, event) => {
                    const ministry = event.ministry;
                    if (ministry && ministry.name) {
                        acc[ministry.name] = (acc[ministry.name] || 0) + 1;
                    }
                    return acc;
                }, {})
            }
        };
        res.status(200).json({
            status: 'success',
            data: { report }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getChurchOverview = getChurchOverview;
