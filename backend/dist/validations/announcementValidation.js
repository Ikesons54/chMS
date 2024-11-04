"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.announcementValidation = {
    create: joi_1.default.object({
        title: joi_1.default.string()
            .required()
            .min(3)
            .max(100)
            .trim()
            .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 100 characters'
        }),
        message: joi_1.default.string()
            .required()
            .min(10)
            .max(1000)
            .trim()
            .messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 10 characters long',
            'string.max': 'Message cannot exceed 1000 characters'
        }),
        priority: joi_1.default.string()
            .valid('low', 'medium', 'high')
            .default('medium')
            .messages({
            'any.only': 'Priority must be either low, medium, or high'
        }),
        expiresAt: joi_1.default.date()
            .min('now')
            .optional()
            .messages({
            'date.min': 'Expiry date must be in the future'
        })
    })
};
