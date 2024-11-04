import { Schedule, ISchedule, ReportFrequency, ReportType } from '../models/Schedule';
import { emailService } from './emailService';
import { addDays, addWeeks, addMonths, addQuarters } from 'date-fns';
import ExcelJS from 'exceljs';
import { Donation, IDonation } from '../models/Donation';
import { Document, Types } from 'mongoose';
import { logger } from '../utils/logger';
import { Buffer } from 'buffer';

interface ReportParameters {
  startDate: Date;
  endDate: Date;
  reportType: string;
  [key: string]: any;
}

interface IDonorPopulated {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface IDonationPopulated extends Omit<Document<unknown, {}, IDonation>, 'donor'> {
  donor: IDonorPopulated;
  date: Date;
  amount: number;
  receiptNumber: string;
}

async function generateTitheReport(parameters: ReportParameters): Promise<ExcelJS.Buffer> {
  const { startDate, endDate } = parameters;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tithe Report');

  const donations = await Donation.find({
    type: 'tithe',
    date: { $gte: startDate, $lte: endDate }
  }).populate<{ donor: IDonorPopulated }>('donor', 'firstName lastName email');

  worksheet.addRow(['Date', 'Donor', 'Amount', 'Receipt Number']);
  
  const populatedDonations = donations as unknown as IDonationPopulated[];
  
  populatedDonations.forEach((donation) => {
    worksheet.addRow([
      donation.date,
      `${donation.donor.firstName} ${donation.donor.lastName}`,
      donation.amount,
      donation.receiptNumber
    ]);
  });

  return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
}

interface IScheduleStatus {
  lastRun?: Date;
  nextRun: Date;
  lastStatus?: 'completed' | 'failed';
  lastError?: string | null;
}

interface IRecipient {
  _id: Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface ISchedulePopulated extends Omit<ISchedule, 'recipients'> {
  recipients: IRecipient[];
  lastRun?: Date;
  lastStatus?: 'completed' | 'failed';
  lastError?: string | null;
}

export class SchedulerService {
  private checkInterval: NodeJS.Timeout;

  constructor() {
    // Check for scheduled tasks every minute
    this.checkInterval = setInterval(() => this.processScheduledReports(), 60000);
    logger.info('Scheduler service initialized');
  }

  public async processScheduledReports(): Promise<void> {
    try {
      const now = new Date();
      const dueSchedules = await Schedule.find({
        isActive: true,
        nextRun: { $lte: now }
      }).populate<{ recipients: IRecipient[] }>('recipients', 'email firstName lastName');

      for (const schedule of dueSchedules) {
        const populatedSchedule = schedule.toObject() as ISchedulePopulated;
        await this.processSchedule(populatedSchedule, now);
      }
    } catch (error) {
      logger.error('Error processing scheduled reports:', error);
      throw new Error('Failed to process scheduled reports');
    }
  }

  private async processSchedule(
    schedule: ISchedulePopulated,
    now: Date
  ): Promise<void> {
    try {
      const reportBuffer = await this.generateReport(schedule);
      const recipientEmails = schedule.recipients.map(r => r.email);

      await emailService.sendBulkEmail(
        recipientEmails,
        'scheduledReport',
        {
          type: 'scheduledReport',
          name: schedule.name,
          reportType: schedule.reportType,
          startDate: schedule.lastRun?.toLocaleDateString(),
          endDate: now.toLocaleDateString(),
          attachments: [{
            filename: `${schedule.reportType}-report-${now.toISOString().split('T')[0]}.xlsx`, 
            content: Buffer.from(reportBuffer)
          }]
        }
      );

      await Schedule.findByIdAndUpdate(schedule._id, {
        lastRun: now,
        nextRun: this.calculateNextRun(schedule.frequency, now),
        lastStatus: 'completed',
        lastError: null
      });

      logger.info(`Schedule ${schedule._id} processed successfully`);
    } catch (error) {
      logger.error(`Error processing schedule ${schedule._id}:`, error);
      
      await Schedule.findByIdAndUpdate(schedule._id, {
        lastStatus: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  private calculateNextRun(frequency: ReportFrequency, from: Date): Date {
    switch (frequency) {
      case ReportFrequency.DAILY:
        return addDays(from, 1);
      case ReportFrequency.WEEKLY:
        return addWeeks(from, 1);
      case ReportFrequency.MONTHLY:
        return addMonths(from, 1);
      case ReportFrequency.QUARTERLY:
        return addQuarters(from, 1);
      default:
        return addDays(from, 1);
    }
  }

  private async generateReport(schedule: ISchedulePopulated | ISchedule): Promise<ExcelJS.Buffer> {
    const parameters: ReportParameters = {
      startDate: schedule.lastRun || new Date(0),
      endDate: new Date(),
      reportType: schedule.reportType,
      ...schedule.parameters
    };

    try {
      switch (schedule.reportType) {
        case ReportType.TITHE:
          return await generateTitheReport(parameters);
        default:
          throw new Error(`Unsupported report type: ${schedule.reportType}`);
      }
    } catch (error) {
      logger.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  public async createSchedule(scheduleData: Partial<ISchedule>): Promise<ISchedule> {
    try {
      const schedule = await Schedule.create({
        ...scheduleData,
        nextRun: this.calculateNextRun(
          scheduleData.frequency || ReportFrequency.DAILY,
          new Date()
        )
      });
      logger.info(`New schedule created with ID: ${schedule._id}`);
      return schedule;
    } catch (error) {
      logger.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  public async updateSchedule(
    scheduleId: string,
    updates: Partial<ISchedule>
  ): Promise<ISchedule | null> {
    try {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      Object.assign(schedule, updates);
      
      if (updates.frequency) {
        schedule.nextRun = this.calculateNextRun(updates.frequency, new Date());
      }

      await schedule.save();
      logger.info(`Schedule ${scheduleId} updated successfully`);
      return schedule;
    } catch (error) {
      logger.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  public async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      const result = await Schedule.deleteOne({ _id: scheduleId });
      if (result.deletedCount === 0) {
        throw new Error('Schedule not found');
      }
      logger.info(`Schedule ${scheduleId} deleted successfully`);
    } catch (error) {
      logger.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  }

  public cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export const schedulerService = new SchedulerService();