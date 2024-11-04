import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';

export const createAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content, startDate, endDate, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      startDate,
      endDate,
      priority,
      createdBy: req.user?._id
    });

    res.status(201).json({
      status: 'success',
      data: { announcement }
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcements = await Announcement.find({
      endDate: { $gte: new Date() }
    }).sort({ priority: -1, startDate: 1 });

    res.status(200).json({
      status: 'success',
      data: { announcements }
    });
  } catch (error) {
    next(error);
  }
}; 