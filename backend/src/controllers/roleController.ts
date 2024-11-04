import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, role } = req.body;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    // Find user and update role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Send email notification with correct EmailOptions interface
    await emailService.sendEmail({
      to: user.email,
      subject: 'Role Update',
      template: 'roleUpdate',
      data: {
        name: user.firstName,
        newRole: role,
        type: 'roleUpdate'
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return next(new AppError('Invalid role', 400));
    }

    const users = await User.find({ role }).select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
}; 