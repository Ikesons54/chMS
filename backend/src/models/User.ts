import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Enum for user roles
export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  ELDER = 'elder',
  DEACON = 'deacon',
  DEACONESS = 'deaconess',
  MEMBER = 'member',
  GUEST = 'guest'
}

// Enum for marital status
export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  WIDOWED = 'widowed',
  DIVORCED = 'divorced'
}

// Enum for permissions
export enum Permission {
  MANAGE_USERS = 'manage_users',
  MANAGE_TITHES = 'manage_tithes',
  MANAGE_MEMBERS = 'manage_members',
  VIEW_REPORTS = 'view_reports',
  APPROVE_APPLICATIONS = 'approve_applications',
  MANAGE_ANNOUNCEMENTS = 'manage_announcements',
  MANAGE_DONATIONS = 'manage_donations'
}

// Mapping of user roles to their permissions
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.PASTOR]: Object.values(Permission),
  [UserRole.ELDER]: [
    Permission.VIEW_REPORTS,
    Permission.MANAGE_MEMBERS,
    Permission.APPROVE_APPLICATIONS,
    Permission.MANAGE_ANNOUNCEMENTS
  ],
  [UserRole.DEACON]: [
    Permission.VIEW_REPORTS,
    Permission.MANAGE_TITHES,
    Permission.MANAGE_DONATIONS
  ],
  [UserRole.DEACONESS]: [
    Permission.VIEW_REPORTS,
    Permission.MANAGE_TITHES,
    Permission.MANAGE_DONATIONS
  ],
  [UserRole.MEMBER]: [
    Permission.VIEW_REPORTS
  ],
  [UserRole.GUEST]: []
};

// Interface for user activity logs
export interface IUserActivity {
  action: string; // Description of the action performed
  timestamp: Date; // When the action occurred
  ipAddress?: string; // IP address of the user
  userAgent?: string; // User agent string from the request
  details?: Record<string, any>; // Additional details about the activity
}

// Interface for user profile information
export interface IUserProfile {
  birthday?: {
    day: number; // Day of birth
    month: number; // Month of birth
  };
  gender?: 'male' | 'female'; // Gender of the user
  maritalStatus?: MaritalStatus; // Marital status of the user
  nationality?: string; // Nationality of the user
  languages?: string[]; // Languages spoken by the user
  waterBaptism?: {
    isWaterBaptised: boolean; // Whether the user has been water baptized
    date?: Date; // Date of water baptism
  };
  holyGhostBaptism?: {
    isHolyGhostBaptised: boolean; // Whether the user has received the Holy Ghost baptism
    date?: Date; // Date of Holy Ghost baptism
  };
}

// Interface for user session information
export interface IUserSession {
  token: string; // Session token
  device: string; // Device used for the session
  lastActive: Date; // Last active timestamp
  expiresAt: Date; // Expiration date of the session
}

// Main user interface extending Mongoose Document
export interface IUser extends Document {
  email: string; // User's email address
  password: string; // User's password (hashed)
  firstName: string; // User's first name
  lastName: string; // User's last name
  middleName?: string; // User's middle name (optional)
  memberId?: string; // Unique member ID for the user
  role: UserRole; // User's role in the church
  phoneNumber?: string; // User's phone number
  whatsappNumber?: string; // User's WhatsApp number
  alternatePhoneNumber?: string; // Alternate phone number
  profilePicture?: string; // URL to the user's profile picture
  isEmailVerified: boolean; // Whether the user's email is verified
  emailVerificationToken?: string; // Token for email verification
  emailVerificationExpires?: Date; // Expiration date for email verification token
  passwordResetToken?: string; // Token for password reset
  passwordResetExpires?: Date; // Expiration date for password reset token
  lastLogin?: Date; // Timestamp of the last login
  lastPasswordChange?: Date; // Timestamp of the last password change
  isActive: boolean; // Whether the user's account is active
  isTwoFactorEnabled: boolean; // Whether two-factor authentication is enabled
  twoFactorSecret?: string; // Secret for two-factor authentication
  membershipStatus: 'pending' | 'active' | 'inactive'; // Membership status
  ministries: mongoose.Types.ObjectId[]; // List of ministries the user is part of
  profile: IUserProfile; // User's profile information
  address?: {
    state: string; // User's state of residence
  };
  emergencyContact?: {
    name: string; // Name of the emergency contact
    relationship: string; // Relationship to the user
    phoneNumber: string; // Phone number of the emergency contact
    email?: string; // Email of the emergency contact (optional)
  };
  activityLog: IUserActivity[]; // Log of user activities
  loginAttempts: number; // Number of login attempts
  lockUntil?: Date; // Date until the account is locked
  preferences: {
    notifications: {
      email: boolean; // Email notification preference
      sms: boolean; // SMS notification preference
      whatsapp: boolean; // WhatsApp notification preference
      push: boolean; // Push notification preference
    };
    language: string; // Preferred language
    timezone: string; // Preferred timezone
  };
  createdAt: Date; // Timestamp of when the user was created
  updatedAt: Date; // Timestamp of when the user was last updated
  sessions: IUserSession[]; // List of user sessions
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
  createPasswordResetToken(): string; // Method to create a password reset token
  isLocked(): boolean; // Method to check if the account is locked
  incrementLoginAttempts(): Promise<void>; // Method to increment login attempts
  resetLoginAttempts(): Promise<void>; // Method to reset login attempts
  logActivity(activity: Omit<IUserActivity, 'timestamp'>): Promise<void>; // Method to log user activity
  createSession(device: string): Promise<void>; // Method to create a new session
  invalidateSession(token: string): Promise<void>; // Method to invalidate a session
}

// Mongoose schema definition for the user
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'], // Email is required
    unique: true, // Email must be unique
    lowercase: true, // Convert email to lowercase
    trim: true, // Trim whitespace
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Validate email format
      },
      message: 'Please provide a valid email address' // Error message for invalid email
    }
  },
  memberId: {
    type: String,
    unique: true, // Member ID must be unique
    sparse: true // Allows null values while maintaining uniqueness
  },
  password: {
    type: String,
    required: [true, 'Password is required'], // Password is required
    minlength: 8, // Minimum length for password
    select: false // Do not return password by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'], // First name is required
    trim: true // Trim whitespace
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'], // Last name is required
    trim: true // Trim whitespace
  },
  role: {
    type: String,
    enum: Object.values(UserRole), // Role must be one of the defined UserRoles
    default: UserRole.MEMBER // Default role is MEMBER
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(phone: string) {
        return /^\+?[\d\s-]+$/.test(phone); // Validate phone number format
      },
      message: 'Please provide a valid phone number' // Error message for invalid phone number
    }
  },
  profilePicture: {
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url); // Validate image URL format
      },
      message: 'Please provide a valid image URL' // Error message for invalid image URL
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false // Default is not verified
  },
  emailVerificationToken: String, // Token for email verification
  emailVerificationExpires: Date, // Expiration date for email verification token
  passwordResetToken: String, // Token for password reset
  passwordResetExpires: Date, // Expiration date for password reset token
  lastLogin: Date, // Timestamp of the last login
  isActive: {
    type: Boolean,
    default: true // Default is active
  },
  membershipStatus: {
    type: String,
    enum: ['pending', 'active', 'inactive'], // Membership status options
    default: 'pending' // Default status is pending
  },
  ministries: [{
    type: Schema.Types.ObjectId,
    ref: 'Ministry' // Reference to the Ministry model
  }],
  address: {
    state: String // User's state of residence
  },
  emergencyContact: {
    name: String, // Name of the emergency contact
    relationship: String, // Relationship to the user
    phoneNumber: String // Phone number of the emergency contact
  },
  profile: {
    birthday: {
      day: { type: Number, min: 1, max: 31 }, // Day of birth
      month: { type: Number, min: 1, max: 12 } // Month of birth
    },
    gender: {
      type: String,
      enum: ['male', 'female'] // Gender options
    },
    maritalStatus: {
      type: String,
      enum: Object.values(MaritalStatus) // Marital status options
    },
    nationality: String, // Nationality of the user
    languages: [String], // Languages spoken by the user
    waterBaptism: {
      isWaterBaptised: { type: Boolean, default: false }, // Water baptism status
      date: Date // Date of water baptism
    },
    holyGhostBaptism: {
      isHolyGhostBaptised: { type: Boolean, default: false }, // Holy Ghost baptism status
      date: Date // Date of Holy Ghost baptism
    }
  },
  activityLog: [{
    action: {
      type: String,
      required: true // Action is required
    },
    timestamp: {
      type: Date,
      default: Date.now // Default to current date
    },
    ipAddress: String, // IP address of the user
    userAgent: String, // User agent string from the request
    details: Schema.Types.Mixed // Additional details about the activity
  }],
  loginAttempts: {
    type: Number,
    default: 0 // Default number of login attempts
  },
  lockUntil: Date, // Date until the account is locked
  preferences: {
    notifications: {
      email: { type: Boolean, default: true }, // Email notification preference
      sms: { type: Boolean, default: false }, // SMS notification preference
      whatsapp: { type: Boolean, default: false }, // WhatsApp notification preference
      push: { type: Boolean, default: true } // Push notification preference
    },
    language: { type: String, default: 'en' }, // Preferred language
    timezone: { type: String, default: 'UTC' } // Preferred timezone
  },
  sessions: [{
    token: String, // Session token
    device: String, // Device used for the session
    lastActive: Date, // Last active timestamp
    expiresAt: Date // Expiration date of the session
  }]
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Index for geolocation queries
userSchema.index({ 'address.location': '2dsphere' });

// Methods for login attempts and account locking
userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date()); // Check if the account is locked
};

// Increment login attempts and lock account if necessary
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 }, // Reset login attempts
      $unset: { lockUntil: 1 } // Remove lock until
    });
  } else {
    const updates: { $inc: { loginAttempts: number }; $set?: { lockUntil: Date } } = {
      $inc: { loginAttempts: 1 } // Increment login attempts
    };
    if (this.loginAttempts + 1 >= 5) {
      updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // Lock for 2 hours
    }
    await this.updateOne(updates); // Update the user document
  }
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 }, // Reset login attempts
    $unset: { lockUntil: 1 } // Remove lock until
  });
};

// Log user activity
userSchema.methods.logActivity = async function(
  activity: Omit<IUserActivity, 'timestamp'> // Omit timestamp from activity
): Promise<void> {
  this.activityLog.push({
    ...activity,
    timestamp: new Date() // Add current timestamp
  });
  await this.save(); // Save the user document
};

// Generate a unique member ID
async function generateMemberId(): Promise<string> {
  const prefix = 'COPAD'; // Prefix for member ID
  let isUnique = false;
  let memberId = '';
  
  while (!isUnique) {
    // Generate random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000);
    memberId = `${prefix}${random}`;
    
    // Check if ID exists
    const existingUser = await mongoose.model('User').findOne({ memberId });
    if (!existingUser) {
      isUnique = true; // Unique member ID found
    }
  }
  
  return memberId; // Return the unique member ID
}

// Middleware to generate member ID before saving
userSchema.pre<IUser>('save', async function(next) {
  if (this.isNew && !this.memberId && 
    [UserRole.MEMBER, UserRole.DEACON, UserRole.DEACONESS, UserRole.ELDER].includes(this.role)) {
    this.memberId = await generateMemberId(); // Generate member ID
  }
  next(); // Proceed to the next middleware
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip if password is not modified
  
  const salt = await bcrypt.genSalt(12); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next(); // Proceed to the next middleware
});

// Update lastLogin timestamp
userSchema.pre<IUser>('save', function(next) {
  if (this.isNew || this.isModified('lastLogin')) {
    this.lastLogin = new Date(); // Set last login to current date
  }
  next(); // Proceed to the next middleware
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password); // Compare candidate password with stored password
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Generate a random token

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // Hash the reset token

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Set expiration for 10 minutes

  return resetToken; // Return the plain reset token
};

// Create a new session for the user
userSchema.methods.createSession = async function(device: string): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex'); // Generate a random session token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Set expiration for 30 days

  this.sessions.push({ token, device, lastActive: new Date(), expiresAt }); // Add session to the user's sessions
  await this.save(); // Save the user document
};

// Invalidate a session by token
userSchema.methods.invalidateSession = async function(token: string): Promise<void> {
  this.sessions = this.sessions.filter((session: IUserSession) => session.token !== token); // Remove session with the given token
  await this.save(); // Save the user document
};

// Export the User model
export const User = mongoose.model<IUser>('User', userSchema);