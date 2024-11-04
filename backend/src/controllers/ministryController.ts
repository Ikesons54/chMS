import { Request, Response, NextFunction } from 'express';
import { Ministry, IMinistry } from '../models/Ministry';
import { AppError } from '../middleware/errorHandler';

export const createMinistry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      leader,
      assistants,
      meetingSchedule
    } = req.body;

    const ministry = await Ministry.create({
      name,
      description,
      leader,
      assistants,
      meetingSchedule
    });

    res.status(201).json({
      status: 'success',
      data: { ministry }
    });
  } catch (error) {
    next(error);
  }
};

export const getMinistries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ministries = await Ministry.find()
      .populate('leader', 'firstName lastName')
      .populate('assistants', 'firstName lastName')
      .populate('members', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: { ministries }
    });
  } catch (error) {
    next(error);
  }
}; 