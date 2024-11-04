"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const titheRoutes_1 = __importDefault(require("./routes/titheRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    logger_1.logger.info('Connected to MongoDB');
})
    .catch((error) => {
    logger_1.logger.error('MongoDB connection error:', error);
});
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(','),
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});
app.use(limiter);
// Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/events', eventRoutes_1.default);
app.use('/api/v1/attendance', attendanceRoutes_1.default);
app.use('/api/v1/notifications', notificationRoutes_1.default);
app.use('/api/v1/tithes', titheRoutes_1.default);
// Health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(port, () => {
    logger_1.logger.info(`Server running on port ${port}`);
});
exports.default = app;
