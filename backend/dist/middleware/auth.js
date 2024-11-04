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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get token and check if it exists
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw new Error('You are not logged in! Please log in to get access.');
        }
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3) Check if user still exists
        const currentUser = yield User_1.User.findById(decoded.id);
        if (!currentUser) {
            throw new Error('The user belonging to this token no longer exists.');
        }
        // 4) Check if user changed password after the token was issued
        if (currentUser.lastPasswordChange) {
            const changedTimestamp = currentUser.lastPasswordChange.getTime() / 1000;
            if (decoded.iat && decoded.iat < changedTimestamp) {
                throw new Error('User recently changed password! Please log in again.');
            }
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.protect = protect;
