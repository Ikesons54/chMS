"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authValidation = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        firstName: joi_1.default.string().required(),
        lastName: joi_1.default.string().required()
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required()
    }),
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().required()
    }),
    resetPassword: joi_1.default.object({
        password: joi_1.default.string().min(8).required(),
        passwordConfirm: joi_1.default.string().valid(joi_1.default.ref('password')).required()
    }),
    updatePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required(),
        newPassword: joi_1.default.string().min(8).required(),
        newPasswordConfirm: joi_1.default.string().valid(joi_1.default.ref('newPassword')).required()
    })
};
