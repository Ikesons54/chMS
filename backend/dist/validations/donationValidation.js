"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const Donation_1 = require("../models/Donation");
exports.donationValidation = {
    create: joi_1.default.object({
        donorId: joi_1.default.string().optional(),
        type: joi_1.default.string()
            .valid(...Object.values(Donation_1.DonationType))
            .required()
            .messages({
            'any.required': 'Donation type is required',
            'any.only': 'Please select a valid donation type'
        }),
        amount: joi_1.default.number()
            .positive()
            .required()
            .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'any.required': 'Amount is required'
        }),
        notes: joi_1.default.string().optional(),
        // Tithe specific validation
        titheDetails: joi_1.default.when('type', {
            is: Donation_1.DonationType.TITHE,
            then: joi_1.default.object({
                personPaying: joi_1.default.string()
                    .required()
                    .messages({
                    'any.required': 'Person paying the tithe is required'
                }),
                titheOwner: joi_1.default.string()
                    .required()
                    .messages({
                    'any.required': 'Tithe owner name is required'
                }),
                month: joi_1.default.string()
                    .optional()
                    .valid('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
                year: joi_1.default.number()
                    .optional()
                    .min(2000)
                    .max(new Date().getFullYear())
            }).required(),
            otherwise: joi_1.default.optional()
        }),
        // Other category validation
        otherCategoryDetails: joi_1.default.when('type', {
            is: Donation_1.DonationType.OTHER,
            then: joi_1.default.object({
                categoryName: joi_1.default.string()
                    .required()
                    .messages({
                    'any.required': 'Category name is required for other donations'
                }),
                description: joi_1.default.string().optional()
            }).required(),
            otherwise: joi_1.default.optional()
        })
    })
};
