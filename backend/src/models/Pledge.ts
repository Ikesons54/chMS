import mongoose, { Document, Schema } from 'mongoose';

export interface IPledge extends Document {
  memberId: mongoose.Types.ObjectId; // Reference to the User
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
}

const pledgeSchema = new Schema<IPledge>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

export const Pledge = mongoose.model<IPledge>('Pledge', pledgeSchema); 