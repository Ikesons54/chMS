import mongoose, { Document, Schema } from 'mongoose';
import { ServiceType } from '../controllers/attendanceController';

export interface IAttendeeBase {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  age: number;
  isVisitor: boolean;
}

export interface ICategories {
  men: number;
  women: number;
  children: number;
  youth: number;
  visitors: number;
}

export interface IAttendance extends Document {
  eventId: mongoose.Types.ObjectId;
  attendees: IAttendeeBase[];
  date: Date;
  serviceType: ServiceType;
  notes?: string;
  categories: ICategories;
  recordedBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  lastModifiedAt?: Date;
}

const serviceTypes = [
  'SUNDAY_SERVICE',
  'BIBLE_STUDY',
  'PRAYER_MEETING',
  'SPECIAL_EVENT'
] as const;

const attendanceSchema = new Schema<IAttendance>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  date: {
    type: Date,
    required: true
  },
  serviceType: {
    type: String,
    enum: serviceTypes,
    required: true
  },
  notes: String,
  categories: {
    men: { type: Number, default: 0 },
    women: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    youth: { type: Number, default: 0 },
    visitors: { type: Number, default: 0 }
  },
  recordedBy: {
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

// Add index for better query performance
attendanceSchema.index({ eventId: 1, date: 1 });

// Add validation for categories total matching attendees length
attendanceSchema.pre('save', function(next) {
  const categoriesTotal = Object.values(this.categories).reduce((sum, count) => sum + count, 0);
  if (this.attendees.length !== categoriesTotal) {
    next(new Error('Categories total must match number of attendees'));
  }
  next();
});

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema); 