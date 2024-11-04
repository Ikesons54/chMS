import { Request, Response, NextFunction } from 'express';
import { Attendance, ICategories } from '../models/Attendance';
import { AppError } from '../middleware/errorHandler';

// Define the ServiceType enum
export enum ServiceType {
  SUNDAY_SERVICE = 'SUNDAY_SERVICE',
  BIBLE_STUDY = 'BIBLE_STUDY',
  PRAYER_MEETING = 'PRAYER_MEETING',
  SPECIAL_EVENT = 'SPECIAL_EVENT'
}

// Function to record attendance
export const recordAttendance = async (
  _req: Request, 
  res: Response, 
  _next: NextFunction
) => {
  try {
    const {
      eventId,
      attendees,
      serviceType,
      notes,
      categories,
      recordedBy
    } = _req.body;

    // Validate categories totals
    const categoriesTotal = Object.values(categories as ICategories).reduce(
      (sum, count) => sum + count,
      0
    );

    if (categoriesTotal !== attendees.length) {
      throw new AppError(
        'Categories total does not match number of attendees',
        400
      );
    }

    const attendance = await Attendance.create({
      eventId,
      attendees,
      date: new Date(),
      serviceType,
      notes,
      categories,
      recordedBy,
      lastModifiedBy: recordedBy,
      lastModifiedAt: new Date()
    });

    await attendance.populate([
      { path: 'attendees', select: 'firstName lastName gender age' },
      { path: 'recordedBy', select: 'firstName lastName' },
      { path: 'eventId', select: 'title date' }
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to record attendance'
      });
    }
  }
};

// Function to get attendance by event
export const getAttendanceByEvent = async (
  _req: Request, 
  res: Response, 
  _next: NextFunction
) => {
  try {
    const { eventId } = _req.params;
    
    const attendanceRecords = await Attendance.findOne({ eventId })
      .populate('attendees', 'firstName lastName gender age')
      .populate('recordedBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .populate('eventId', 'title date');
    
    if (!attendanceRecords) {
      throw new AppError('No attendance records found for this event', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        attendanceRecords
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve attendance records'
      });
    }
  }
};

// Function to update attendance
export const updateAttendance = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = _req.params;
    const {
      attendees,
      categories,
      lastModifiedBy
    } = _req.body;

    // Validate categories totals if categories are being updated
    if (categories && attendees) {
      const categoriesTotal = Object.values(categories as ICategories).reduce(
        (sum, count) => sum + count,
        0
      );

      if (categoriesTotal !== attendees.length) {
        throw new AppError(
          'Categories total does not match number of attendees',
          400
        );
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        ..._req.body,
        lastModifiedBy,
        lastModifiedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'attendees', select: 'firstName lastName gender age' },
      { path: 'recordedBy', select: 'firstName lastName' },
      { path: 'lastModifiedBy', select: 'firstName lastName' },
      { path: 'eventId', select: 'title date' }
    ]);

    if (!attendance) {
      throw new AppError('No attendance record found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update attendance record'
      });
    }
  }
};