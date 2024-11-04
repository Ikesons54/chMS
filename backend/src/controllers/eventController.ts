import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { AppError } from '../middleware/errorHandler';
import { IUser } from '../models/User';

// Create a custom interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: IUser | undefined; // Change to IUser | undefined
}

export const createEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      ministry,
      maxAttendees,
      isRecurring,
      recurringDetails
    } = req.body;

    const event = await Event.create({
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      ministry,
      organizer: req.user?._id,
      maxAttendees,
      isRecurring,
      recurringDetails,
      createdBy: req.user?._id
    });

    res.status(201).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, ministry, type } = req.query;
    
    const query: Record<string, any> = {};
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate as string) };
      query.endDate = { $lte: new Date(endDate as string) };
    }
    if (ministry) query.ministry = ministry;
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('ministry', 'name')
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: 1 });

    res.status(200).json({
      status: 'success',
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('ministry', 'name')
      .populate('organizer', 'firstName lastName');

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { updatedEvent }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return next(new AppError('Event not found', 404));
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};