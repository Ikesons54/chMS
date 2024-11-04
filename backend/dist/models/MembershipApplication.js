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
exports.MembershipApplication = exports.getUpcomingBirthdays = exports.formatBirthday = exports.membershipValidation = exports.MinistryDepartments = exports.MaritalStatus = exports.Gender = exports.ApplicationStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const nationalities_1 = require("../constants/nationalities");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["UNDER_REVIEW"] = "under_review";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "single";
    MaritalStatus["MARRIED"] = "married";
    MaritalStatus["WIDOWED"] = "widowed";
    MaritalStatus["DIVORCED"] = "divorced";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var MinistryDepartments;
(function (MinistryDepartments) {
    MinistryDepartments["CHILDREN"] = "children";
    MinistryDepartments["YOUTH"] = "youth";
    MinistryDepartments["EVANGELISM"] = "evangelism";
    MinistryDepartments["WORSHIP"] = "worship";
    MinistryDepartments["CHOIR"] = "choir";
    MinistryDepartments["USHERING"] = "ushering";
    MinistryDepartments["PRAYER"] = "prayer";
    MinistryDepartments["MEDIA"] = "media";
    MinistryDepartments["WELFARE"] = "welfare";
    MinistryDepartments["MENS_MINISTRY"] = "mens_ministry";
    MinistryDepartments["WOMENS_MINISTRY"] = "womens_ministry";
})(MinistryDepartments || (exports.MinistryDepartments = MinistryDepartments = {}));
const membershipApplicationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: [true, 'Gender is required']
    },
    middleName: {
        type: String,
        trim: true
    },
    birthday: {
        day: {
            type: Number,
            required: true,
            min: 1,
            max: 31
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        }
    },
    nationality: {
        type: String,
        required: true,
        enum: nationalities_1.NATIONALITIES,
        trim: true
    },
    maritalStatus: {
        type: String,
        enum: Object.values(MaritalStatus),
        required: true
    },
    spouseFullName: {
        type: String,
        trim: true,
        required: function () {
            return this.maritalStatus === MaritalStatus.MARRIED;
        }
    },
    residentialAddress: {
        area: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        poBox: { type: String, trim: true }
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    whatsappNumber: {
        type: String,
        trim: true
    },
    emergencyContact: {
        name: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
    },
    familyMembers: [{
            name: { type: String, trim: true },
            relationship: { type: String, trim: true },
            age: { type: Number }
        }],
    salvationExperience: {
        isSaved: { type: Boolean, required: true },
        dateOfSalvation: { type: Date },
        testimony: { type: String, trim: true }
    },
    waterBaptism: {
        isBaptized: { type: Boolean, required: true },
        date: { type: Date },
        place: { type: String, trim: true },
        minister: { type: String, trim: true }
    },
    holyGhostBaptism: {
        isBaptized: { type: Boolean, required: true },
        date: { type: Date },
        speakingInTongues: { type: Boolean }
    },
    attendanceFrequency: {
        type: String,
        enum: ['regular', 'occasional', 'new'],
        required: true
    },
    ministryInterests: [{
            type: String,
            enum: Object.values(MinistryDepartments),
            required: true
        }],
    currentMinistryInvolvement: [{
            type: String,
            enum: Object.values(MinistryDepartments)
        }],
    spiritualGifts: [String],
    specialSkills: [String],
    occupation: String,
    prayer_requests: [String],
    status: {
        type: String,
        enum: Object.values(ApplicationStatus),
        default: ApplicationStatus.PENDING
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNotes: String,
    submissionDate: {
        type: Date,
        default: Date.now
    },
    reviewDate: Date,
    approvalDate: Date,
    documents: {
        baptismCertificate: String,
        marriageCertificate: String,
        otherDocuments: [String]
    }
}, {
    timestamps: true
});
// Helper function to validate days in months
function isValidDayForMonth(day, month) {
    const thirtyDayMonths = [4, 6, 9, 11];
    const thirtyOneDayMonths = [1, 3, 5, 7, 8, 10, 12];
    if (month === 2) {
        return day <= 29; // Allowing 29 for February to account for leap years
    }
    if (thirtyDayMonths.includes(month)) {
        return day <= 30;
    }
    if (thirtyOneDayMonths.includes(month)) {
        return day <= 31;
    }
    return false;
}
// Virtual for formatted birthday
membershipApplicationSchema.virtual('formattedBirthday').get(function () {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${this.birthday.day} ${months[this.birthday.month - 1]}`;
});
// Add validation for birthday
membershipApplicationSchema.path('birthday').validate(function (birthday) {
    if (!birthday.day || !birthday.month) {
        return false;
    }
    return isValidDayForMonth(birthday.day, birthday.month);
}, 'Invalid birthday');
// Update the validation schema for the membership application
exports.membershipValidation = {
    create: joi_1.default.object({
        gender: joi_1.default.string().valid(...Object.values(Gender)).required(),
        middleName: joi_1.default.string().trim().optional(),
        birthday: joi_1.default.object({
            day: joi_1.default.number().min(1).max(31).required()
                .messages({
                'number.base': 'Day must be a number',
                'number.min': 'Day must be at least 1',
                'number.max': 'Day cannot be more than 31',
                'any.required': 'Day is required'
            }),
            month: joi_1.default.number().min(1).max(12).required()
                .messages({
                'number.base': 'Month must be a number',
                'number.min': 'Month must be at least 1',
                'number.max': 'Month cannot be more than 12',
                'any.required': 'Month is required'
            })
        }).required()
            .custom((value, helpers) => {
            if (!isValidDayForMonth(value.day, value.month)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
            .messages({
            'any.invalid': 'Invalid day for the selected month'
        }),
        nationality: joi_1.default.string().required().trim(),
        maritalStatus: joi_1.default.string()
            .valid('single', 'married', 'widowed', 'divorced')
            .required(),
        residentialAddress: joi_1.default.object({
            area: joi_1.default.string().required().trim(),
            city: joi_1.default.string().required().trim(),
            country: joi_1.default.string().required().trim(),
            poBox: joi_1.default.string().trim().optional()
        }).required(),
        emergencyContact: joi_1.default.object({
            name: joi_1.default.string().required().trim(),
            relationship: joi_1.default.string().required().trim(),
            phone: joi_1.default.string().required().trim()
        }).required(),
        dateOfJoining: joi_1.default.object({
            month: joi_1.default.number().min(1).max(12),
            year: joi_1.default.number().min(1900).max(new Date().getFullYear())
        }).optional(),
        waterBaptism: joi_1.default.object({
            isBaptized: joi_1.default.boolean().required(),
            date: joi_1.default.date().optional(),
            place: joi_1.default.string().optional()
        }).required(),
        holyGhostBaptism: joi_1.default.object({
            isBaptized: joi_1.default.boolean().required(),
            date: joi_1.default.date().optional()
        }).required(),
        ministryInterests: joi_1.default.array().items(joi_1.default.string().trim()).required(),
        spiritualGifts: joi_1.default.array().items(joi_1.default.string().trim()).optional(),
        documents: joi_1.default.object({
            baptismCertificate: joi_1.default.string().optional(),
            marriageCertificate: joi_1.default.string().optional(),
            otherDocuments: joi_1.default.array().items(joi_1.default.string()).optional()
        }).optional()
    })
};
// Example usage in controller
const formatBirthday = (day, month) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${day} ${months[month - 1]}`;
};
exports.formatBirthday = formatBirthday;
// Example query to find members with upcoming birthdays
const getUpcomingBirthdays = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (daysAhead = 30) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    return yield exports.MembershipApplication.find({
        $or: [
            // Same month, upcoming days
            {
                'birthday.month': currentMonth,
                'birthday.day': {
                    $gte: currentDay,
                    $lte: currentDay + daysAhead
                }
            },
            // Next month(s)
            {
                'birthday.month': {
                    $gt: currentMonth,
                    $lte: currentMonth + Math.ceil(daysAhead / 30)
                }
            },
            // Handle year wrap-around
            {
                'birthday.month': {
                    $lte: (currentMonth + Math.ceil(daysAhead / 30)) % 12
                }
            }
        ]
    }).populate('userId', 'firstName lastName email');
});
exports.getUpcomingBirthdays = getUpcomingBirthdays;
// Validation for date of joining
membershipApplicationSchema.pre('save', function (next) {
    if (this.dateOfJoining) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (this.dateOfJoining.year > currentYear ||
            (this.dateOfJoining.year === currentYear &&
                this.dateOfJoining.month > currentMonth)) {
            next(new Error('Date of joining cannot be in the future'));
        }
    }
    next();
});
// Indexes
membershipApplicationSchema.index({ userId: 1 }, { unique: true });
membershipApplicationSchema.index({ status: 1 });
membershipApplicationSchema.index({ submissionDate: 1 });
// Virtual for full name
membershipApplicationSchema.virtual('fullName').get(function () {
    const user = this.populated('userId');
    return user ?
        `${user.firstName} ${this.middleName ? this.middleName + ' ' : ''}${user.lastName}`
        : '';
});
// Virtual for age
membershipApplicationSchema.virtual('age').get(function () {
    return null;
});
// Add custom validation for married status
membershipApplicationSchema.path('spouseFullName').validate(function (value) {
    if (this.maritalStatus === MaritalStatus.MARRIED && !value) {
        return false;
    }
    return true;
}, 'Spouse name is required for married members');
// Add validation for salvation experience
membershipApplicationSchema.path('salvationExperience').validate(function (value) {
    if (value.isSaved && !value.testimony) {
        return false;
    }
    return true;
}, 'Testimony is required if saved');
exports.MembershipApplication = mongoose_1.default.model('MembershipApplication', membershipApplicationSchema);
