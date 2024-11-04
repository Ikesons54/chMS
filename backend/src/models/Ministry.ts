import mongoose, { Document, Schema } from 'mongoose';

export interface IMinistry extends Document {
  name: string;
  description?: string;
  leader: mongoose.Types.ObjectId;
  assistants: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  meetingSchedule?: {
    day: string;
    time: string;
    location: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ministrySchema = new Schema<IMinistry>({
  name: {
    type: String,
    required: [true, 'Ministry name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ministry leader is required']
  },
  assistants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  meetingSchedule: {
    day: String,
    time: String,
    location: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Ministry = mongoose.model<IMinistry>('Ministry', ministrySchema); 