import { Request, Response, NextFunction } from 'express';
import { Schedule, ISchedule } from '../models/Schedule';
import { AppError } from '../middleware/errorHandler';

export const createSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedule = await Schedule.create({
      ...req.body,
      createdBy: req.user?._id
    });

    res.status(201).json({
      status: 'success',
      data: { schedule }
    });
  } catch (error) {
    next(error);
  }
};

export const getSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedules = await Schedule.find()
      .populate('createdBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: { schedules }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!schedule) {
      return next(new AppError('Schedule not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { schedule }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return next(new AppError('Schedule not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 