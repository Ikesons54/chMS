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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const logger_1 = require("./logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    loadTemplate(templateName) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../templates/emails', `${templateName}.hbs`);
            return fs_1.default.readFileSync(templatePath, 'utf-8');
        });
    }
    compileTemplate(template, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const compiledTemplate = handlebars_1.default.compile(template);
            return compiledTemplate(data);
        });
    }
    sendEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, subject, template, data }) {
            try {
                // Load and compile template
                const templateContent = yield this.loadTemplate(template);
                const html = yield this.compileTemplate(templateContent, data);
                // Send email
                yield this.transporter.sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: email,
                    subject,
                    html,
                });
                logger_1.logger.info(`Email sent successfully to ${email}`);
            }
            catch (error) {
                logger_1.logger.error('Error sending email:', error);
                throw new Error('Failed to send email');
            }
        });
    }
}
// Create and export a singleton instance
const emailService = new EmailService();
exports.sendEmail = emailService.sendEmail.bind(emailService);
