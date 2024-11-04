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
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const Event_1 = require("../models/Event");
const errorHandler_1 = require("../middleware/errorHandler");
const createEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, description, type, startDate, endDate, location, ministry, maxAttendees, isRecurring, recurringDetails } = req.body;
        const event = yield Event_1.Event.create({
            title,
            description,
            type,
            startDate,
            endDate,
            location,
            ministry,
            organizer: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            maxAttendees,
            isRecurring,
            recurringDetails,
            createdBy: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        res.status(201).json({
            status: 'success',
            data: { event }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createEvent = createEvent;
const getEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, ministry, type } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate) };
            query.endDate = { $lte: new Date(endDate) };
        }
        if (ministry)
            query.ministry = ministry;
        if (type)
            query.type = type;
        const events = yield Event_1.Event.find(query)
            .populate('ministry', 'name')
            .populate('organizer', 'firstName lastName')
            .sort({ startDate: 1 });
        res.status(200).json({
            status: 'success',
            data: { events }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEvents = getEvents;
const getEventById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.Event.findById(req.params.id)
            .populate('ministry', 'name')
            .populate('organizer', 'firstName lastName');
        if (!event) {
            return next(new errorHandler_1.AppError('Event not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { event }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEventById = getEventById;
const updateEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedEvent = yield Event_1.Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEvent) {
            return next(new errorHandler_1.AppError('Event not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { updatedEvent }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEvent = updateEvent;
const deleteEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return next(new errorHandler_1.AppError('Event not found', 404));
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteEvent = deleteEvent;
