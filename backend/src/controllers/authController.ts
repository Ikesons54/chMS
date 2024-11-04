import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emailService } from '../services/emailService';

// Create a custom interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: IUser | undefined;
}

export const register = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, role = 'member' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already exists', 400));
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = _req.params;
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = _req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user found with this email address', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset',
      template: 'passwordReset',
      data: {
        type: 'passwordReset',
        name: user.firstName,
        resetURL
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = _req.params;
    const { password } = _req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = _req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      throw new Error('User not authenticated');
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.comparePassword(req.body.currentPassword))) {
      throw new Error('Your current password is wrong');
    }

    user.password = req.body.password;
    await user.save();

    await user.logActivity({
      action: 'PASSWORD_CHANGE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const testEndpoint = async (
  _req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Test endpoint successful'
    });
  } catch (error) {
    next(error);
  }
};