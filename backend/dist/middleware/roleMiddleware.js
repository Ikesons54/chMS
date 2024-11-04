"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.hasRole = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("./errorHandler");
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Not authenticated', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.hasRole = hasRole;
const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Not authenticated', 401));
        }
        const userRole = req.user.role;
        const userPermissions = User_1.RolePermissions[userRole];
        if (!userPermissions.includes(requiredPermission)) {
            return next(new errorHandler_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.hasPermission = hasPermission;
