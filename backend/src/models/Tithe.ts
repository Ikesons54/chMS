import mongoose, { Document, Schema } from 'mongoose';

export interface ITithe extends Document {
  amount: number;
  currency: string; // Add currency field
  memberId: mongoose.Types.ObjectId; // Reference to the User
  date: Date;
}

const titheSchema = new Schema<ITithe>({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'AED'] // Add supported currencies
  },
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Tithe = mongoose.model<ITithe>('Tithe', titheSchema); 