import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { User, UserRole, IUser } from '../models/User';
import { MembershipApplication, ApplicationStatus } from '../models/MembershipApplication';
import { emailService } from '../services/emailService';

interface AdminUser {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const notifyAdmins = async (admins: AdminUser[], applicantName: string) => {
  for (const admin of admins) {
    await emailService.sendEmail({
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
};

export const submitMembershipApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const applicationData = {
      userId: req.user._id,
      ...req.body
    };

    const application = await MembershipApplication.create(applicationData);

    // Notify church leadership
    const admins = await User.find({ 
      role: { $in: [UserRole.ADMIN, UserRole.PASTOR] }
    });

    await notifyAdmins(admins, `${req.user.firstName} ${req.user.lastName}`);

    res.status(201).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

export const reviewMembershipApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await MembershipApplication.findById(applicationId);
    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user?._id as Types.ObjectId | undefined;
    application.reviewDate = new Date();

    if (status === ApplicationStatus.APPROVED) {
      application.approvalDate = new Date();
      
      // Update user role to MEMBER and generate member ID
      const updatedUser = await User.findByIdAndUpdate(
        application.userId,
        {
          role: UserRole.MEMBER,
          membershipDate: new Date()
        },
        { new: true }
      ).exec();

      // Send approval email with member ID
      if (updatedUser) {
        await emailService.sendEmail({
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

    await application.save();

    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}; 