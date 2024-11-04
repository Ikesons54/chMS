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
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.templates = {};
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.initializeTemplates();
                yield this.createTransporter();
            }
            catch (error) {
                console.error('Failed to initialize email service:', error);
                throw new Error('Email service initialization failed');
            }
        });
    }
    createTransporter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (process.env.NODE_ENV === 'production') {
                    const OAuth2 = googleapis_1.google.auth.OAuth2;
                    const oauth2Client = new OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URI);
                    oauth2Client.setCredentials({
                        refresh_token: process.env.GMAIL_REFRESH_TOKEN
                    });
                    const accessToken = yield oauth2Client.getAccessToken();
                    this.transporter = nodemailer_1.default.createTransport({
                        service: 'gmail',
                        auth: {
                            type: 'OAuth2',
                            user: process.env.EMAIL_FROM,
                            clientId: process.env.GMAIL_CLIENT_ID,
                            clientSecret: process.env.GMAIL_CLIENT_SECRET,
                            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                            accessToken: (accessToken === null || accessToken === void 0 ? void 0 : accessToken.token) || undefined
                        }
                    });
                }
                else {
                    this.transporter = nodemailer_1.default.createTransport({
                        host: process.env.EMAIL_HOST,
                        port: parseInt(process.env.EMAIL_PORT || '587'),
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });
                }
                // Verify the connection
                yield this.transporter.verify();
            }
            catch (error) {
                console.error('Failed to create email transporter:', error);
                throw new Error('Email transporter creation failed');
            }
        });
    }
    initializeTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const templatesDir = path_1.default.join(__dirname, '../templates/emails');
                // Create templates directory if it doesn't exist
                if (!fs_1.default.existsSync(templatesDir)) {
                    fs_1.default.mkdirSync(templatesDir, { recursive: true });
                }
                const templateFiles = fs_1.default.readdirSync(templatesDir);
                templateFiles.forEach(file => {
                    if (path_1.default.extname(file) === '.hbs') {
                        const templateName = path_1.default.parse(file).name;
                        const templateContent = fs_1.default.readFileSync(path_1.default.join(templatesDir, file), 'utf-8');
                        this.templates[templateName] = handlebars_1.default.compile(templateContent);
                    }
                });
            }
            catch (error) {
                console.error('Failed to initialize email templates:', error);
                throw new Error('Email templates initialization failed');
            }
        });
    }
    getEmailSubject(type) {
        const subjects = {
            welcome: 'Welcome to COP Abu Dhabi!',
            newMembershipApplication: 'New Membership Application Received',
            applicationApproved: 'Your Membership Application has been Approved',
            applicationRejected: 'Update on Your Membership Application',
            passwordReset: 'Password Reset Request',
            emailVerification: 'Verify Your Email Address',
            eventReminder: 'Upcoming Event Reminder',
            donationReceipt: 'Thank You for Your Donation'
        };
        return subjects[type] || 'COP Abu Dhabi Notification';
    }
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.transporter) {
                    yield this.createTransporter();
                }
                const template = this.templates[options.template];
                if (!template) {
                    throw new Error(`Template ${options.template} not found`);
                }
                const html = template(options.data);
                const mailOptions = {
                    from: `COP Abu Dhabi <${process.env.EMAIL_FROM}>`,
                    to: options.to,
                    subject: this.getEmailSubject(options.data.type),
                    html,
                    attachments: options.attachments
                };
                yield this.transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error('Email sending failed:', error);
                throw new Error('Failed to send email');
            }
        });
    }
    sendBulkEmail(recipients, template, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.transporter) {
                    yield this.createTransporter();
                }
                const emailPromises = recipients.map(recipient => this.sendEmail({
                    to: recipient,
                    template,
                    subject: this.getEmailSubject(data.type),
                    data
                }));
                yield Promise.all(emailPromises);
            }
            catch (error) {
                console.error('Bulk email sending failed:', error);
                throw new Error('Failed to send bulk emails');
            }
        });
    }
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.transporter) {
                    yield this.createTransporter();
                }
                yield this.transporter.verify();
                return true;
            }
            catch (error) {
                console.error('Email service verification failed:', error);
                return false;
            }
        });
    }
}
// Create and export a singleton instance
exports.emailService = new EmailService();
