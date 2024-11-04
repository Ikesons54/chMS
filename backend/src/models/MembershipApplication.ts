import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';
import { NATIONALITIES } from '../constants/nationalities';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  WIDOWED = 'widowed',
  DIVORCED = 'divorced'
}

export enum MinistryDepartments {
  CHILDREN = 'children',
  YOUTH = 'youth',
  EVANGELISM = 'evangelism',
  WORSHIP = 'worship',
  CHOIR = 'choir',
  USHERING = 'ushering',
  PRAYER = 'prayer',
  MEDIA = 'media',
  WELFARE = 'welfare',
  MENS_MINISTRY = 'mens_ministry',
  WOMENS_MINISTRY = 'womens_ministry'
}

export interface IMembershipApplication extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Personal Information
  gender: Gender;
  middleName?: string;
  birthday: {
    day: number;
    month: number;
  };
  nationality: string;
  maritalStatus: MaritalStatus;
  spouseFullName?: string; // Required if married
  
  // Contact Information
  residentialAddress: {
    area: string;
    city: string;
    country: string;
    poBox?: string;
  };
  phoneNumber: string;
  whatsappNumber?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Family Information
  familyMembers?: {
    name: string;
    relationship: string;
    age?: number;
  }[];

  // Church Background
  previousChurchBackground?: {
    churchName?: string;
    location?: string;
    yearAttended?: string;
    reasonForLeaving?: string;
  };

  // Spiritual Information
  dateOfJoining?: {
    month: number;
    year: number;
  };
  salvationExperience: {
    isSaved: boolean;
    dateOfSalvation?: Date;
    testimony?: string;
  };
  waterBaptism: {
    isBaptized: boolean;
    date?: Date;
    place?: string;
    minister?: string;
  };
  holyGhostBaptism: {
    isBaptized: boolean;
    date?: Date;
    speakingInTongues?: boolean;
  };

  // Church Involvement
  attendanceFrequency: 'regular' | 'occasional' | 'new';
  ministryInterests: MinistryDepartments[];
  currentMinistryInvolvement?: MinistryDepartments[];
  spiritualGifts?: string[];
  
  // Additional Information
  specialSkills?: string[];
  occupation?: string;
  prayer_requests?: string[];
  
  // Application Status
  status: ApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  submissionDate: Date;
  reviewDate?: Date;
  approvalDate?: Date;

  // Documents
  documents?: {
    baptismCertificate?: string;
    marriageCertificate?: string;
    otherDocuments?: string[];
  };
}

const membershipApplicationSchema = new Schema<IMembershipApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: [true, 'Gender is required']
  },
  middleName: {
    type: String,
    trim: true
  },
  birthday: {
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    }
  },
  nationality: {
    type: String,
    required: true,
    enum: NATIONALITIES,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: Object.values(MaritalStatus),
    required: true
  },
  spouseFullName: {
    type: String,
    trim: true,
    required: function(this: IMembershipApplication) {
      return this.maritalStatus === MaritalStatus.MARRIED;
    }
  },
  residentialAddress: {
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    poBox: { type: String, trim: true }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  familyMembers: [{
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    age: { type: Number }
  }],
  salvationExperience: {
    isSaved: { type: Boolean, required: true },
    dateOfSalvation: { type: Date },
    testimony: { type: String, trim: true }
  },
  waterBaptism: {
    isBaptized: { type: Boolean, required: true },
    date: { type: Date },
    place: { type: String, trim: true },
    minister: { type: String, trim: true }
  },
  holyGhostBaptism: {
    isBaptized: { type: Boolean, required: true },
    date: { type: Date },
    speakingInTongues: { type: Boolean }
  },
  attendanceFrequency: {
    type: String,
    enum: ['regular', 'occasional', 'new'],
    required: true
  },
  ministryInterests: [{
    type: String,
    enum: Object.values(MinistryDepartments),
    required: true
  }],
  currentMinistryInvolvement: [{
    type: String,
    enum: Object.values(MinistryDepartments)
  }],
  spiritualGifts: [String],
  specialSkills: [String],
  occupation: String,
  prayer_requests: [String],
  status: {
    type: String,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  approvalDate: Date,
  documents: {
    baptismCertificate: String,
    marriageCertificate: String,
    otherDocuments: [String]
  }
}, {
  timestamps: true
});

// Helper function to validate days in months
function isValidDayForMonth(day: number, month: number): boolean {
  const thirtyDayMonths = [4, 6, 9, 11];
  const thirtyOneDayMonths = [1, 3, 5, 7, 8, 10, 12];
  
  if (month === 2) {
    return day <= 29; // Allowing 29 for February to account for leap years
  }
  
  if (thirtyDayMonths.includes(month)) {
    return day <= 30;
  }
  
  if (thirtyOneDayMonths.includes(month)) {
    return day <= 31;
  }
  
  return false;
}

// Virtual for formatted birthday
membershipApplicationSchema.virtual('formattedBirthday').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${this.birthday.day} ${months[this.birthday.month - 1]}`;
});

// Add validation for birthday
membershipApplicationSchema.path('birthday').validate(function(birthday: any) {
  if (!birthday.day || !birthday.month) {
    return false;
  }
  return isValidDayForMonth(birthday.day, birthday.month);
}, 'Invalid birthday');

// Update the validation schema for the membership application
export const membershipValidation = {
  create: Joi.object({
    gender: Joi.string().valid(...Object.values(Gender)).required(),
    middleName: Joi.string().trim().optional(),
    birthday: Joi.object({
      day: Joi.number().min(1).max(31).required()
        .messages({
          'number.base': 'Day must be a number',
          'number.min': 'Day must be at least 1',
          'number.max': 'Day cannot be more than 31',
          'any.required': 'Day is required'
        }),
      month: Joi.number().min(1).max(12).required()
        .messages({
          'number.base': 'Month must be a number',
          'number.min': 'Month must be at least 1',
          'number.max': 'Month cannot be more than 12',
          'any.required': 'Month is required'
        })
    }).required()
      .custom((value: { day: number; month: number }, helpers: Joi.CustomHelpers) => {
        if (!isValidDayForMonth(value.day, value.month)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .messages({
        'any.invalid': 'Invalid day for the selected month'
      }),
    nationality: Joi.string().required().trim(),
    maritalStatus: Joi.string()
      .valid('single', 'married', 'widowed', 'divorced')
      .required(),
    residentialAddress: Joi.object({
      area: Joi.string().required().trim(),
      city: Joi.string().required().trim(),
      country: Joi.string().required().trim(),
      poBox: Joi.string().trim().optional()
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string().required().trim(),
      relationship: Joi.string().required().trim(),
      phone: Joi.string().required().trim()
    }).required(),
    dateOfJoining: Joi.object({
      month: Joi.number().min(1).max(12),
      year: Joi.number().min(1900).max(new Date().getFullYear())
    }).optional(),
    waterBaptism: Joi.object({
      isBaptized: Joi.boolean().required(),
      date: Joi.date().optional(),
      place: Joi.string().optional()
    }).required(),
    holyGhostBaptism: Joi.object({
      isBaptized: Joi.boolean().required(),
      date: Joi.date().optional()
    }).required(),
    ministryInterests: Joi.array().items(Joi.string().trim()).required(),
    spiritualGifts: Joi.array().items(Joi.string().trim()).optional(),
    documents: Joi.object({
      baptismCertificate: Joi.string().optional(),
      marriageCertificate: Joi.string().optional(),
      otherDocuments: Joi.array().items(Joi.string()).optional()
    }).optional()
  })
};

// Example usage in controller
export const formatBirthday = (day: number, month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${day} ${months[month - 1]}`;
};

// Example query to find members with upcoming birthdays
export const getUpcomingBirthdays = async (daysAhead: number = 30) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  return await MembershipApplication.find({
    $or: [
      // Same month, upcoming days
      {
        'birthday.month': currentMonth,
        'birthday.day': {
          $gte: currentDay,
          $lte: currentDay + daysAhead
        }
      },
      // Next month(s)
      {
        'birthday.month': {
          $gt: currentMonth,
          $lte: currentMonth + Math.ceil(daysAhead / 30)
        }
      },
      // Handle year wrap-around
      {
        'birthday.month': {
          $lte: (currentMonth + Math.ceil(daysAhead / 30)) % 12
        }
      }
    ]
  }).populate('userId', 'firstName lastName email');
};

// Validation for date of joining
membershipApplicationSchema.pre('save', function(next) {
  if (this.dateOfJoining) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (this.dateOfJoining.year > currentYear || 
       (this.dateOfJoining.year === currentYear && 
        this.dateOfJoining.month > currentMonth)) {
      next(new Error('Date of joining cannot be in the future'));
    }
  }
  next();
});

// Indexes
membershipApplicationSchema.index({ userId: 1 }, { unique: true });
membershipApplicationSchema.index({ status: 1 });
membershipApplicationSchema.index({ submissionDate: 1 });

// Virtual for full name
membershipApplicationSchema.virtual('fullName').get(function() {
  const user = this.populated('userId') as any;
  return user ? 
    `${user.firstName} ${this.middleName ? this.middleName + ' ' : ''}${user.lastName}` 
    : '';
});

// Virtual for age
membershipApplicationSchema.virtual('age').get(function() {
  return null;
});

// Add custom validation for married status
membershipApplicationSchema.path('spouseFullName').validate(function(value: string) {
  if (this.maritalStatus === MaritalStatus.MARRIED && !value) {
    return false;
  }
  return true;
}, 'Spouse name is required for married members');

// Add validation for salvation experience
membershipApplicationSchema.path('salvationExperience').validate(function(value: any) {
  if (value.isSaved && !value.testimony) {
    return false;
  }
  return true;
}, 'Testimony is required if saved');

export const MembershipApplication = mongoose.model<IMembershipApplication>(
  'MembershipApplication', 
  membershipApplicationSchema
); 