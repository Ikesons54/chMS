import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary, removeFromCloudinary } from '../utils/cloudinary';
import { logger } from '../utils/logger';

// Define custom request type with file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        firstName,
        lastName,
        phoneNumber,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const user = await User.findById(req.user?._id) as IUser;
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // If user already has a profile picture, delete it from cloudinary
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
      if (publicId) {
        await removeFromCloudinary(publicId);
      }
    }

    // Upload new profile picture to cloudinary
    const result = await uploadToCloudinary(req.file.path);

    // Update user's profile picture
    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user?._id).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect password', 401));
    }

    // If user has a profile picture, delete it from cloudinary
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
      if (publicId) {
        await removeFromCloudinary(publicId);
      }
    }

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 