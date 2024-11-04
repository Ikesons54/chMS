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
exports.Event = exports.RecurringPattern = exports.EventStatus = exports.EventType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var EventType;
(function (EventType) {
    EventType["SUNDAY_SERVICE"] = "sunday_service";
    EventType["MIDWEEK_SERVICE"] = "midweek_service";
    EventType["PRAYER_MEETING"] = "prayer_meeting";
    EventType["SPECIAL_SERVICE"] = "special_service";
    EventType["YOUTH_SERVICE"] = "youth_service";
    EventType["CHILDREN_SERVICE"] = "children_service";
    EventType["MINISTRY_MEETING"] = "ministry_meeting";
    EventType["OUTREACH"] = "outreach";
    EventType["FELLOWSHIP"] = "fellowship";
    EventType["TRAINING"] = "training";
})(EventType || (exports.EventType = EventType = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["SCHEDULED"] = "scheduled";
    EventStatus["IN_PROGRESS"] = "in_progress";
    EventStatus["COMPLETED"] = "completed";
    EventStatus["CANCELLED"] = "cancelled";
    EventStatus["POSTPONED"] = "postponed";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var RecurringPattern;
(function (RecurringPattern) {
    RecurringPattern["DAILY"] = "daily";
    RecurringPattern["WEEKLY"] = "weekly";
    RecurringPattern["BIWEEKLY"] = "biweekly";
    RecurringPattern["MONTHLY"] = "monthly";
    RecurringPattern["QUARTERLY"] = "quarterly";
})(RecurringPattern || (exports.RecurringPattern = RecurringPattern = {}));
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: Object.values(EventType),
        required: [true, 'Event type is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (endDate) {
                return endDate >= this.startDate;
            },
            message: 'End date must be after or equal to start date'
        }
    },
    location: {
        name: {
            type: String,
            required: [true, 'Location name is required']
        },
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        capacity: {
            type: Number,
            min: [0, 'Capacity cannot be negative']
        }
    },
    ministry: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Ministry'
    },
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event organizer is required']
    },
    maxAttendees: {
        type: Number,
        min: [0, 'Maximum attendees cannot be negative']
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDetails: {
        pattern: {
            type: String,
            enum: Object.values(RecurringPattern)
        },
        interval: Number,
        endDate: Date
    },
    status: {
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.SCHEDULED
    },
    notes: String,
    attachments: [String],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: Date
}, {
    timestamps: true
});
// Indexes for faster queries
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ ministry: 1 });
eventSchema.index({ status: 1 });
// Pre-save middleware to update lastModifiedAt
eventSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.lastModifiedAt = new Date();
    }
    next();
});
// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
    return this.startDate > new Date();
});
// Virtual for checking if event is ongoing
eventSchema.virtual('isOngoing').get(function () {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
});
// Virtual for duration in hours
eventSchema.virtual('durationHours').get(function () {
    return (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60);
});
exports.Event = mongoose_1.default.model('Event', eventSchema);
