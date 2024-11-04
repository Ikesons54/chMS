import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export enum ReportType {
  TITHE = 'TITHE',
  OFFERING = 'OFFERING',
  DONATION = 'DONATION',
  ATTENDANCE = 'ATTENDANCE',
  MINISTRY = 'MINISTRY'
}

export interface ISchedule extends Document {
  name: string;
  description?: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  recipients: Types.ObjectId[];
  parameters?: Record<string, any>;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  lastStatus?: 'completed' | 'failed';
  lastError?: string | null;
}

const scheduleSchema = new Schema<ISchedule>({
  name: {
    type: String,
    required: [true, 'Schedule name is required']
  },
  description: String,
  reportType: {
    type: String,
    enum: Object.values(ReportType),
    required: [true, 'Report type is required']
  },
  frequency: {
    type: String,
    enum: Object.values(ReportFrequency),
    required: [true, 'Frequency is required']
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one recipient is required']
  }],
  parameters: {
    type: Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: Date,
  nextRun: {
    type: Date,
    required: true
  },
  lastStatus: {
    type: String,
    enum: ['completed', 'failed']
  },
  lastError: String
});

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema); 