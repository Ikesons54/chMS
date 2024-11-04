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
exports.reviewMembershipApplication = exports.submitMembershipApplication = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User");
const MembershipApplication_1 = require("../models/MembershipApplication");
const emailService_1 = require("../services/emailService");
const notifyAdmins = (admins, applicantName) => __awaiter(void 0, void 0, void 0, function* () {
    for (const admin of admins) {
        yield emailService_1.emailService.sendEmail({
            to: admin.email,
            subject: 'New Membership Application',
            template: 'newMembershipApplication',
            data: {
                type: 'newMembershipApplication',
                name: admin.firstName,
                applicantName: applicantName
            }
        });
    }
});
const submitMembershipApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        const applicationData = Object.assign({ userId: req.user._id }, req.body);
        const application = yield MembershipApplication_1.MembershipApplication.create(applicationData);
        // Notify church leadership
        const admins = yield User_1.User.find({
            role: { $in: [User_1.UserRole.ADMIN, User_1.UserRole.PASTOR] }
        });
        yield notifyAdmins(admins, `${req.user.firstName} ${req.user.lastName}`);
        res.status(201).json({
            status: 'success',
            data: {
                application
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.submitMembershipApplication = submitMembershipApplication;
const reviewMembershipApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { applicationId } = req.params;
        const { status, reviewNotes } = req.body;
        const application = yield MembershipApplication_1.MembershipApplication.findById(applicationId);
        if (!application) {
            return next(new errorHandler_1.AppError('Application not found', 404));
        }
        application.status = status;
        application.reviewNotes = reviewNotes;
        application.reviewedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        application.reviewDate = new Date();
        if (status === MembershipApplication_1.ApplicationStatus.APPROVED) {
            application.approvalDate = new Date();
            // Update user role to MEMBER and generate member ID
            const updatedUser = yield User_1.User.findByIdAndUpdate(application.userId, {
                role: User_1.UserRole.MEMBER,
                membershipDate: new Date()
            }, { new: true }).exec();
            // Send approval email with member ID
            if (updatedUser) {
                yield emailService_1.emailService.sendEmail({
                    to: updatedUser.email,
                    subject: 'Welcome to Church of Pentecost Abu Dhabi',
                    template: 'welcome',
                    data: {
                        type: 'welcome',
                        name: updatedUser.firstName,
                        memberId: updatedUser.memberId
                    }
                });
            }
        }
        yield application.save();
        res.status(200).json({
            status: 'success',
            data: {
                application
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.reviewMembershipApplication = reviewMembershipApplication;
