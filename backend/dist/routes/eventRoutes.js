"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const eventController_1 = require("../controllers/eventController");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Create a new event
router.post('/', eventController_1.createEvent);
// Get all events
router.get('/', eventController_1.getEvents);
// Update an event by ID
router.patch('/:eventId', eventController_1.updateEvent);
// Delete an event by ID
router.delete('/:eventId', eventController_1.deleteEvent);
exports.default = router;
