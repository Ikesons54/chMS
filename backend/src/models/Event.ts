import mongoose, { Document, Schema } from 'mongoose';

export enum EventType {
  SUNDAY_SERVICE = 'sunday_service',
  MIDWEEK_SERVICE = 'midweek_service',
  PRAYER_MEETING = 'prayer_meeting',
  SPECIAL_SERVICE = 'special_service',
  YOUTH_SERVICE = 'youth_service',
  CHILDREN_SERVICE = 'children_service',
  MINISTRY_MEETING = 'ministry_meeting',
  OUTREACH = 'outreach',
  FELLOWSHIP = 'fellowship',
  TRAINING = 'training'
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export enum RecurringPattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

interface ILocation {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity?: number;
}

interface IRecurringDetails {
  pattern: RecurringPattern;
  interval: number;
  endDate: Date;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  location: ILocation;
  ministry?: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  maxAttendees?: number;
  isRecurring: boolean;
  recurringDetails?: IRecurringDetails;
  status: EventStatus;
  notes?: string;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  lastModifiedAt?: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(EventType),
    required: [true, 'Event type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IEvent, endDate: Date) {
        return endDate >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    capacity: {
      type: Number,
      min: [0, 'Capacity cannot be negative']
    }
  },
  ministry: {
    type: Schema.Types.ObjectId,
    ref: 'Ministry'
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },
  maxAttendees: {
    type: Number,
    min: [0, 'Maximum attendees cannot be negative']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    pattern: {
      type: String,
      enum: Object.values(RecurringPattern)
    },
    interval: Number,
    endDate: Date
  },
  status: {
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.SCHEDULED
  },
  notes: String,
  attachments: [String],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ ministry: 1 });
eventSchema.index({ status: 1 });

// Pre-save middleware to update lastModifiedAt
eventSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastModifiedAt = new Date();
  }
  next();
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function(this: IEvent) {
  return this.startDate > new Date();
});

// Virtual for checking if event is ongoing
eventSchema.virtual('isOngoing').get(function(this: IEvent) {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual for duration in hours
eventSchema.virtual('durationHours').get(function(this: IEvent) {
  return (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60);
});

export const Event = mongoose.model<IEvent>('Event', eventSchema); 