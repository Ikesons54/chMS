// Base template data interface
interface BaseTemplateData {
  name: string;
}

// Template-specific data interfaces
interface WelcomeTemplateData extends BaseTemplateData {
  type: 'welcome';
  verificationLink?: string;
}

interface RoleUpdateTemplateData extends BaseTemplateData {
  type: 'roleUpdate';
  newRole: string;
}

interface AnnouncementTemplateData extends BaseTemplateData {
  type: 'announcementNotification';
  message: string;
}

interface EventTemplateData extends BaseTemplateData {
  type: 'eventNotification';
  title: string;
  date: string;
  time: string;
  location: string;
}

interface PasswordResetTemplateData extends BaseTemplateData {
  type: 'resetPassword';
  resetURL: string;
}

interface PasswordSuccessTemplateData extends BaseTemplateData {
  type: 'passwordResetSuccess' | 'passwordUpdateSuccess';
}

interface DeaconessAppointmentData extends BaseTemplateData {
  type: 'deaconessAppointment';
  appointmentDate?: string;
}

// Add to your template data types
interface NewMembershipApplicationData extends BaseTemplateData {
  type: 'newMembershipApplication';
  applicantName: string;
}

// Union type of all template data types
type TemplateData = 
  | WelcomeTemplateData 
  | RoleUpdateTemplateData 
  | AnnouncementTemplateData 
  | EventTemplateData 
  | PasswordResetTemplateData 
  | PasswordSuccessTemplateData
  | DeaconessAppointmentData
  | NewMembershipApplicationData;

export const emailTemplates = {
  welcome: (data: WelcomeTemplateData) => ({
    subject: 'Welcome to COP Abu Dhabi',
    html: `
      <h1>Welcome ${data.name}!</h1>
      <p>Thank you for joining the Church of Pentecost Abu Dhabi.</p>
      ${data.verificationLink ? 
        `<p>Please verify your email by clicking <a href="${data.verificationLink}">here</a></p>` 
        : ''
      }
    `,
  }),

  roleUpdate: (data: RoleUpdateTemplateData) => ({
    subject: 'Role Update Notification',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>Your role has been updated to: ${data.newRole}</p>
      <p>This change is effective immediately.</p>
    `,
  }),

  announcementNotification: (data: AnnouncementTemplateData) => ({
    subject: 'New Church Announcement',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>${data.message}</p>
    `,
  }),

  eventNotification: (data: EventTemplateData) => ({
    subject: `New Event: ${data.title}`,
    html: `
      <h1>Hello ${data.name},</h1>
      <p>A new event has been scheduled:</p>
      <h2>${data.title}</h2>
      <p>Date: ${data.date}</p>
      <p>Time: ${data.time}</p>
      <p>Location: ${data.location}</p>
    `,
  }),

  resetPassword: (data: PasswordResetTemplateData) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>You requested to reset your password.</p>
      <p>Click <a href="${data.resetURL}">here</a> to reset your password.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  }),

  passwordResetSuccess: (data: PasswordSuccessTemplateData) => ({
    subject: 'Password Reset Successful',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>Your password has been successfully reset.</p>
      <p>If you didn't make this change, please contact us immediately.</p>
    `,
  }),

  passwordUpdateSuccess: (data: PasswordSuccessTemplateData) => ({
    subject: 'Password Updated Successfully',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>Your password has been successfully updated.</p>
      <p>If you didn't make this change, please contact us immediately.</p>
    `,
  }),

  deaconessAppointment: (data: DeaconessAppointmentData) => ({
    subject: 'Appointment as Deaconess',
    html: `
      <h1>Dear ${data.name},</h1>
      <p>We are pleased to inform you that you have been appointed as a Deaconess in the Church of Pentecost Abu Dhabi.</p>
      <p>This role comes with new responsibilities and privileges in serving the Lord and His church.</p>
      <p>May God grant you wisdom and grace as you serve in this capacity.</p>
      <p>The church leadership will contact you soon regarding your new duties.</p>
      ${data.appointmentDate ? 
        `<p>Your appointment is effective from: ${data.appointmentDate}</p>` 
        : ''
      }
      <br>
      <p>Blessings,</p>
      <p>Church Administration</p>
    `,
  }),

  newMembershipApplication: (data: NewMembershipApplicationData) => ({
    subject: 'New Membership Application',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>A new membership application has been submitted by ${data.applicantName}.</p>
      <p>Please review the application at your earliest convenience.</p>
    `
  }),
} as const;

export type EmailTemplate = keyof typeof emailTemplates;