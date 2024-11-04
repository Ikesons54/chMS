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
exports.getMinistries = exports.createMinistry = void 0;
const Ministry_1 = require("../models/Ministry");
const createMinistry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, leader, assistants, meetingSchedule } = req.body;
        const ministry = yield Ministry_1.Ministry.create({
            name,
            description,
            leader,
            assistants,
            meetingSchedule
        });
        res.status(201).json({
            status: 'success',
            data: { ministry }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createMinistry = createMinistry;
const getMinistries = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ministries = yield Ministry_1.Ministry.find()
            .populate('leader', 'firstName lastName')
            .populate('assistants', 'firstName lastName')
            .populate('members', 'firstName lastName');
        res.status(200).json({
            status: 'success',
            data: { ministries }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMinistries = getMinistries;
