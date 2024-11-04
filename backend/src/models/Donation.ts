import mongoose, { Document, Schema, Types } from 'mongoose';

export enum DonationType {
  TITHE = 'tithe',
  OFFERING = 'offering',
  SPECIAL_OFFERING = 'special_offering',
  FUNDRAISING = 'fundraising',
  MISSIONS = 'missions',
  OTHER = 'other'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other'
}

export enum FundraisingCampaign {
  BUILDING_PROJECT = 'building_project',
  RENOVATION = 'renovation',
  EQUIPMENT = 'equipment',
  MISSION_TRIP = 'mission_trip',
  COMMUNITY_OUTREACH = 'community_outreach',
  YOUTH_PROGRAM = 'youth_program',
  SPECIAL_PROJECT = 'special_project'
}

interface FundraisingDetails {
  campaign: FundraisingCampaign;
  projectName?: string;
  targetAmount?: number;
}

interface TitheDetails {
  titheOwner: mongoose.Types.ObjectId;
  personPaying?: mongoose.Types.ObjectId;
  month?: string;
  year?: number;
}

export interface IDonation extends Document {
  amount: number;
  type: 'tithe' | 'offering' | 'special';
  donor: Types.ObjectId;
  date: Date;
  paymentMethod: string;
  receiptNumber: string;
  notes?: string;
  titheDetails?: TitheDetails;
  fundraisingDetails?: FundraisingDetails;
  recordedBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  lastModifiedAt?: Date;
}

const donationSchema = new Schema<IDonation>({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: Object.values(DonationType),
    required: [true, 'Donation type is required']
  },
  donor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Payment method is required']
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  notes: String,
  titheDetails: {
    titheOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    personPaying: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    month: String,
    year: Number
  },
  fundraisingDetails: {
    campaign: {
      type: String,
      enum: Object.values(FundraisingCampaign)
    },
    projectName: String,
    targetAmount: Number
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

// Add index for faster receipt lookup
donationSchema.index({ receiptNumber: 1 });

// Add compound index for date range queries
donationSchema.index({ date: -1, type: 1 });

export const Donation = mongoose.model<IDonation>('Donation', donationSchema);