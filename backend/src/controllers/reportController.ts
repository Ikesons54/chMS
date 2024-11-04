import { Request, Response, NextFunction } from 'express';
import { Donation, IDonation } from '../models/Donation';
import { Attendance, IAttendance } from '../models/Attendance';
import { Ministry, IMinistry } from '../models/Ministry';
import { Event, IEvent } from '../models/Event';
import { Document, Types } from 'mongoose';

interface DonationSummary {
  total: number;
  count: number;
  byType: Record<string, number>;
}

interface AttendanceSummary {
  averageAttendance: number;
  totalServices: number;
  byService: Record<string, number>;
}

interface MinistryEventSummary {
  totalEvents: number;
  byMinistry: Record<string, number>;
}

interface ChurchReport {
  donations: DonationSummary;
  attendance: AttendanceSummary;
  ministries: MinistryEventSummary;
}

interface PopulatedEvent extends Omit<IEvent, 'ministry'> {
  ministry: IMinistry;
}

export const getChurchOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get donations summary
    const donations = await Donation.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    });

    // Get attendance summary
    const attendance = await Attendance.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    });

    // Get ministry activities with proper typing
    const ministryEvents = await Event.find({
      startDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).populate<{ ministry: IMinistry }>('ministry');

    const report: ChurchReport = {
      donations: {
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        count: donations.length,
        byType: donations.reduce((acc: Record<string, number>, d) => {
          acc[d.type] = (acc[d.type] || 0) + d.amount;
          return acc;
        }, {})
      },
      attendance: {
        averageAttendance: Math.round(
          attendance.reduce((sum, a) => sum + a.attendees.length, 0) / 
          (attendance.length || 1)
        ),
        totalServices: attendance.length,
        byService: attendance.reduce((acc: Record<string, number>, a) => {
          acc[a.serviceType] = (acc[a.serviceType] || 0) + a.attendees.length;
          return acc;
        }, {})
      },
      ministries: {
        totalEvents: ministryEvents.length,
        byMinistry: ministryEvents.reduce((acc: Record<string, number>, event) => {
          const ministry = (event as unknown as PopulatedEvent).ministry;
          if (ministry && ministry.name) {
            acc[ministry.name] = (acc[ministry.name] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      }
    };

    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
}; 