"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.RolePermissions = exports.Permission = exports.MaritalStatus = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
// Enum for user roles
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["PASTOR"] = "pastor";
    UserRole["ELDER"] = "elder";
    UserRole["DEACON"] = "deacon";
    UserRole["DEACONESS"] = "deaconess";
    UserRole["MEMBER"] = "member";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
// Enum for marital status
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "single";
    MaritalStatus["MARRIED"] = "married";
    MaritalStatus["WIDOWED"] = "widowed";
    MaritalStatus["DIVORCED"] = "divorced";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
// Enum for permissions
var Permission;
(function (Permission) {
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["MANAGE_TITHES"] = "manage_tithes";
    Permission["MANAGE_MEMBERS"] = "manage_members";
    Permission["VIEW_REPORTS"] = "view_reports";
    Permission["APPROVE_APPLICATIONS"] = "approve_applications";
    Permission["MANAGE_ANNOUNCEMENTS"] = "manage_announcements";
    Permission["MANAGE_DONATIONS"] = "manage_donations";
})(Permission || (exports.Permission = Permission = {}));
// Mapping of user roles to their permissions
exports.RolePermissions = {
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
// Mongoose schema definition for the user
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], // Email is required
        unique: true, // Email must be unique
        lowercase: true, // Convert email to lowercase
        trim: true, // Trim whitespace
        validate: {
            validator: function (email) {
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
            validator: function (phone) {
                return /^\+?[\d\s-]+$/.test(phone); // Validate phone number format
            },
            message: 'Please provide a valid phone number' // Error message for invalid phone number
        }
    },
    profilePicture: {
        type: String,
        validate: {
            validator: function (url) {
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
            type: mongoose_1.Schema.Types.ObjectId,
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
            details: mongoose_1.Schema.Types.Mixed // Additional details about the activity
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
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date()); // Check if the account is locked
};
// Increment login attempts and lock account if necessary
userSchema.methods.incrementLoginAttempts = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.lockUntil && this.lockUntil < new Date()) {
            yield this.updateOne({
                $set: { loginAttempts: 1 }, // Reset login attempts
                $unset: { lockUntil: 1 } // Remove lock until
            });
        }
        else {
            const updates = {
                $inc: { loginAttempts: 1 } // Increment login attempts
            };
            if (this.loginAttempts + 1 >= 5) {
                updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // Lock for 2 hours
            }
            yield this.updateOne(updates); // Update the user document
        }
    });
};
// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.updateOne({
            $set: { loginAttempts: 0 }, // Reset login attempts
            $unset: { lockUntil: 1 } // Remove lock until
        });
    });
};
// Log user activity
userSchema.methods.logActivity = function (activity // Omit timestamp from activity
) {
    return __awaiter(this, void 0, void 0, function* () {
        this.activityLog.push(Object.assign(Object.assign({}, activity), { timestamp: new Date() // Add current timestamp
         }));
        yield this.save(); // Save the user document
    });
};
// Generate a unique member ID
function generateMemberId() {
    return __awaiter(this, void 0, void 0, function* () {
        const prefix = 'COPAD'; // Prefix for member ID
        let isUnique = false;
        let memberId = '';
        while (!isUnique) {
            // Generate random 4-digit number
            const random = Math.floor(1000 + Math.random() * 9000);
            memberId = `${prefix}${random}`;
            // Check if ID exists
            const existingUser = yield mongoose_1.default.model('User').findOne({ memberId });
            if (!existingUser) {
                isUnique = true; // Unique member ID found
            }
        }
        return memberId; // Return the unique member ID
    });
}
// Middleware to generate member ID before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.memberId &&
            [UserRole.MEMBER, UserRole.DEACON, UserRole.DEACONESS, UserRole.ELDER].includes(this.role)) {
            this.memberId = yield generateMemberId(); // Generate member ID
        }
        next(); // Proceed to the next middleware
    });
});
// Hash password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next(); // Skip if password is not modified
        const salt = yield bcryptjs_1.default.genSalt(12); // Generate salt
        this.password = yield bcryptjs_1.default.hash(this.password, salt); // Hash the password
        next(); // Proceed to the next middleware
    });
});
// Update lastLogin timestamp
userSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('lastLogin')) {
        this.lastLogin = new Date(); // Set last login to current date
    }
    next(); // Proceed to the next middleware
});
// Instance method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, this.password); // Compare candidate password with stored password
    });
};
// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex'); // Generate a random token
    this.passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex'); // Hash the reset token
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Set expiration for 10 minutes
    return resetToken; // Return the plain reset token
};
// Create a new session for the user
userSchema.methods.createSession = function (device) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = crypto_1.default.randomBytes(32).toString('hex'); // Generate a random session token
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Set expiration for 30 days
        this.sessions.push({ token, device, lastActive: new Date(), expiresAt }); // Add session to the user's sessions
        yield this.save(); // Save the user document
    });
};
// Invalidate a session by token
userSchema.methods.invalidateSession = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        this.sessions = this.sessions.filter((session) => session.token !== token); // Remove session with the given token
        yield this.save(); // Save the user document
    });
};
// Export the User model
exports.User = mongoose_1.default.model('User', userSchema);
