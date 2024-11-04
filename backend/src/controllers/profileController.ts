import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Ensure req.user is defined and cast it to IUser
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
}; 