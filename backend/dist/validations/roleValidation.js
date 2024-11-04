"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const User_1 = require("../models/User");
exports.roleValidation = {
    updateRole: joi_1.default.object({
        userId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'User ID is required',
            'string.empty': 'User ID cannot be empty'
        }),
        role: joi_1.default.string()
            .valid(...Object.values(User_1.UserRole))
            .required()
            .messages({
            'any.required': 'Role is required',
            'any.only': `Role must be one of: ${Object.values(User_1.UserRole).join(', ')}`,
            'string.empty': 'Role cannot be empty'
        }),
        ministry: joi_1.default.array()
            .items(joi_1.default.string().trim())
            .when('role', {
            is: joi_1.default.valid(User_1.UserRole.DEACON, User_1.UserRole.DEACONESS, User_1.UserRole.ELDER),
            then: joi_1.default.required(),
            otherwise: joi_1.default.optional()
        })
            .messages({
            'any.required': 'Ministry is required for this role'
        })
    })
};
