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
exports.schedulerService = exports.SchedulerService = void 0;
const Schedule_1 = require("../models/Schedule");
const emailService_1 = require("./emailService");
const date_fns_1 = require("date-fns");
const exceljs_1 = __importDefault(require("exceljs"));
const Donation_1 = require("../models/Donation");
function generateTitheReport(parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { startDate, endDate } = parameters;
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Tithe Report');
        const donations = yield Donation_1.Donation.find({
            type: 'tithe',
            date: { $gte: startDate, $lte: endDate }
        }).populate('donor', 'firstName lastName');
        worksheet.addRow(['Date', 'Donor', 'Amount', 'Receipt Number']);
        donations.forEach((donation) => {
            worksheet.addRow([
                donation.date,
                `${donation.donor.firstName} ${donation.donor.lastName}`,
                donation.amount,
                donation.receiptNumber
            ]);
        });
        const buffer = yield workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    });
}
class SchedulerService {
    processScheduledReports() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const dueSchedules = yield Schedule_1.Schedule.find({
                    isActive: true,
                    nextRun: { $lte: now }
                }).populate('recipients', 'email firstName lastName');
                for (const schedule of dueSchedules) {
                    const populatedSchedule = schedule.toObject();
                    yield this.processSchedule(populatedSchedule, now);
                }
            }
            catch (error) {
                console.error('Error processing scheduled reports:', error);
                throw new Error('Failed to process scheduled reports');
            }
        });
    }
    processSchedule(schedule, now) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const reportBuffer = yield this.generateReport(schedule);
                const recipientEmails = schedule.recipients.map(r => r.email);
                yield emailService_1.emailService.sendBulkEmail(recipientEmails, 'scheduledReport', {
                    type: 'scheduledReport',
                    name: schedule.name,
                    reportType: schedule.reportType,
                    startDate: (_a = schedule.lastRun) === null || _a === void 0 ? void 0 : _a.toLocaleDateString(),
                    endDate: now.toLocaleDateString(),
                    attachments: [{
                            filename: `${schedule.reportType}-report-${now.toISOString().split('T')[0]}.xlsx`,
                            content: reportBuffer
                        }]
                });
                yield Schedule_1.Schedule.findByIdAndUpdate(schedule._id, {
                    lastRun: now,
                    nextRun: this.calculateNextRun(schedule.frequency, now),
                    lastStatus: 'completed',
                    lastError: null
                });
            }
            catch (error) {
                console.error(`Error processing schedule ${schedule._id}:`, error);
                yield Schedule_1.Schedule.findByIdAndUpdate(schedule._id, {
                    lastStatus: 'failed',
                    lastError: error instanceof Error ? error.message : 'Unknown error'
                });
                throw error;
            }
        });
    }
    calculateNextRun(frequency, from) {
        switch (frequency) {
            case Schedule_1.ReportFrequency.DAILY:
                return (0, date_fns_1.addDays)(from, 1);
            case Schedule_1.ReportFrequency.WEEKLY:
                return (0, date_fns_1.addWeeks)(from, 1);
            case Schedule_1.ReportFrequency.MONTHLY:
                return (0, date_fns_1.addMonths)(from, 1);
            case Schedule_1.ReportFrequency.QUARTERLY:
                return (0, date_fns_1.addQuarters)(from, 1);
            default:
                return (0, date_fns_1.addDays)(from, 1);
        }
    }
    generateReport(schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = Object.assign({ startDate: schedule.lastRun || new Date(0), endDate: new Date(), reportType: schedule.reportType }, schedule.parameters);
            try {
                switch (schedule.reportType) {
                    case Schedule_1.ReportType.TITHE:
                        return yield generateTitheReport(parameters);
                    default:
                        throw new Error(`Unsupported report type: ${schedule.reportType}`);
                }
            }
            catch (error) {
                console.error('Error generating report:', error);
                throw new Error('Failed to generate report');
            }
        });
    }
    createSchedule(scheduleData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield Schedule_1.Schedule.create(Object.assign(Object.assign({}, scheduleData), { nextRun: this.calculateNextRun(scheduleData.frequency || Schedule_1.ReportFrequency.DAILY, new Date()) }));
                return schedule;
            }
            catch (error) {
                console.error('Error creating schedule:', error);
                throw new Error('Failed to create schedule');
            }
        });
    }
    updateSchedule(scheduleId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield Schedule_1.Schedule.findById(scheduleId);
                if (!schedule) {
                    throw new Error('Schedule not found');
                }
                Object.assign(schedule, updates);
                if (updates.frequency) {
                    schedule.nextRun = this.calculateNextRun(updates.frequency, new Date());
                }
                yield schedule.save();
                return schedule;
            }
            catch (error) {
                console.error('Error updating schedule:', error);
                throw new Error('Failed to update schedule');
            }
        });
    }
    deleteSchedule(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Schedule_1.Schedule.deleteOne({ _id: scheduleId });
                if (result.deletedCount === 0) {
                    throw new Error('Schedule not found');
                }
            }
            catch (error) {
                console.error('Error deleting schedule:', error);
                throw new Error('Failed to delete schedule');
            }
        });
    }
}
exports.SchedulerService = SchedulerService;
exports.schedulerService = new SchedulerService();
