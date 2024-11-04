import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser | undefined;
}

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, message, recipient } = req.body;

    const notification = await Notification.create({
      title,
      message,
      recipient
    });

    res.status(201).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user?._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
}; 