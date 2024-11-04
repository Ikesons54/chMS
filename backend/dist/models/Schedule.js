"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = exports.ReportType = exports.ReportFrequency = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ReportFrequency;
(function (ReportFrequency) {
    ReportFrequency["DAILY"] = "daily";
    ReportFrequency["WEEKLY"] = "weekly";
    ReportFrequency["MONTHLY"] = "monthly";
    ReportFrequency["QUARTERLY"] = "quarterly";
})(ReportFrequency || (exports.ReportFrequency = ReportFrequency = {}));
var ReportType;
(function (ReportType) {
    ReportType["TITHE"] = "TITHE";
    ReportType["OFFERING"] = "OFFERING";
    ReportType["DONATION"] = "DONATION";
    ReportType["ATTENDANCE"] = "ATTENDANCE";
    ReportType["MINISTRY"] = "MINISTRY";
})(ReportType || (exports.ReportType = ReportType = {}));
const scheduleSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Schedule name is required']
    },
    description: String,
    reportType: {
        type: String,
        enum: Object.values(ReportType),
        required: [true, 'Report type is required']
    },
    frequency: {
        type: String,
        enum: Object.values(ReportFrequency),
        required: [true, 'Frequency is required']
    },
    recipients: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'At least one recipient is required']
        }],
    parameters: {
        type: mongoose_1.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRun: Date,
    nextRun: {
        type: Date,
        required: true
    },
    lastStatus: {
        type: String,
        enum: ['completed', 'failed']
    },
    lastError: String
});
exports.Schedule = mongoose_1.default.model('Schedule', scheduleSchema);
