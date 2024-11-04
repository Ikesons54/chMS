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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const User_1 = require("../models/User");
const logActivity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const activity = {
            action: req.method + ' ' + req.originalUrl,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: {
                body: req.body,
                params: req.params,
                query: req.query
            }
        };
        yield User_1.User.findById(req.user._id).then(user => {
            if (user) {
                user.logActivity(activity);
            }
        });
    }
    next();
});
exports.logActivity = logActivity;
