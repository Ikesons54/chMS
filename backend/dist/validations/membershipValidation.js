"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const nationalities_1 = require("../constants/nationalities");
const MembershipApplication_1 = require("../models/MembershipApplication");
exports.membershipValidation = {
    create: joi_1.default.object({
        gender: joi_1.default.string()
            .valid(...Object.values(MembershipApplication_1.Gender))
            .required()
            .messages({
            'any.required': 'Gender is required',
            'any.only': 'Please select a valid gender'
        }),
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
        }).required(),
        nationality: joi_1.default.string()
            .valid(...nationalities_1.NATIONALITIES)
            .required()
            .messages({
            'any.required': 'Nationality is required',
            'any.only': 'Please select a valid nationality'
        }),
        maritalStatus: joi_1.default.string()
            .valid(...Object.values(MembershipApplication_1.MaritalStatus))
            .required()
            .messages({
            'any.required': 'Marital status is required',
            'any.only': 'Please select a valid marital status'
        }),
        spouseFullName: joi_1.default.string()
            .when('maritalStatus', {
            is: MembershipApplication_1.MaritalStatus.MARRIED,
            then: joi_1.default.string().required().trim(),
            otherwise: joi_1.default.string().optional()
        })
            .messages({
            'any.required': 'Spouse name is required when married'
        }),
        residentialAddress: joi_1.default.object({
            area: joi_1.default.string().required().trim(),
            city: joi_1.default.string().required().trim(),
            country: joi_1.default.string().required().trim(),
            poBox: joi_1.default.string().trim().optional()
        }).required(),
        phoneNumber: joi_1.default.string()
            .required()
            .trim()
            .messages({
            'any.required': 'Phone number is required'
        }),
        whatsappNumber: joi_1.default.string()
            .trim()
            .optional(),
        emergencyContact: joi_1.default.object({
            name: joi_1.default.string().required().trim(),
            relationship: joi_1.default.string().required().trim(),
            phone: joi_1.default.string().required().trim()
        }).required(),
        dateOfJoining: joi_1.default.object({
            month: joi_1.default.number().min(1).max(12),
            year: joi_1.default.number().min(1900).max(new Date().getFullYear())
        }).optional(),
        salvationExperience: joi_1.default.object({
            isSaved: joi_1.default.boolean().required(),
            dateOfSalvation: joi_1.default.date().when('isSaved', {
                is: true,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            testimony: joi_1.default.string().when('isSaved', {
                is: true,
                then: joi_1.default.string().required().min(50),
                otherwise: joi_1.default.optional()
            })
        }).required(),
        waterBaptism: joi_1.default.object({
            isBaptized: joi_1.default.boolean().required(),
            date: joi_1.default.date().when('isBaptized', {
                is: true,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            place: joi_1.default.string().when('isBaptized', {
                is: true,
                then: joi_1.default.string().required().trim(),
                otherwise: joi_1.default.optional()
            }),
            minister: joi_1.default.string().when('isBaptized', {
                is: true,
                then: joi_1.default.string().required().trim(),
                otherwise: joi_1.default.optional()
            })
        }).required(),
        holyGhostBaptism: joi_1.default.object({
            isBaptized: joi_1.default.boolean().required(),
            date: joi_1.default.date().when('isBaptized', {
                is: true,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            speakingInTongues: joi_1.default.boolean().when('isBaptized', {
                is: true,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            })
        }).required(),
        attendanceFrequency: joi_1.default.string()
            .valid('regular', 'occasional', 'new')
            .required()
            .messages({
            'any.required': 'Attendance frequency is required',
            'any.only': 'Please select a valid attendance frequency'
        }),
        ministryInterests: joi_1.default.array()
            .items(joi_1.default.string().valid(...Object.values(MembershipApplication_1.MinistryDepartments)))
            .min(1)
            .required()
            .messages({
            'array.min': 'Please select at least one ministry interest',
            'any.only': 'Please select valid ministry departments'
        }),
        currentMinistryInvolvement: joi_1.default.array()
            .items(joi_1.default.string().valid(...Object.values(MembershipApplication_1.MinistryDepartments)))
            .optional(),
        spiritualGifts: joi_1.default.array()
            .items(joi_1.default.string().trim())
            .optional(),
        specialSkills: joi_1.default.array()
            .items(joi_1.default.string().trim())
            .optional(),
        occupation: joi_1.default.string()
            .trim()
            .optional(),
        prayer_requests: joi_1.default.array()
            .items(joi_1.default.string().trim())
            .optional(),
        documents: joi_1.default.object({
            baptismCertificate: joi_1.default.string().optional(),
            marriageCertificate: joi_1.default.string().when('maritalStatus', {
                is: MembershipApplication_1.MaritalStatus.MARRIED,
                then: joi_1.default.string().required(),
                otherwise: joi_1.default.optional()
            }),
            otherDocuments: joi_1.default.array().items(joi_1.default.string()).optional()
        }).optional()
    })
};
