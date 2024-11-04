export type EmailTemplate = 
  | 'welcome'
  | 'roleUpdate'
  | 'announcementNotification'
  | 'eventNotification'
  | 'passwordReset'
  | 'passwordResetSuccess'
  | 'passwordUpdateSuccess'
  | 'deaconessAppointment'
  | 'newMembershipApplication';

export interface BaseTemplateData {
  name: string;
}

export interface PasswordResetTemplateData extends BaseTemplateData {
  resetURL: string;
  validityPeriod: string;
}

export interface WelcomeTemplateData extends BaseTemplateData {
  verificationUrl: string;
}

export interface RoleUpdateTemplateData extends BaseTemplateData {
  newRole: string;
}

export interface AnnouncementTemplateData extends BaseTemplateData {
  announcementTitle: string;
  announcementContent: string;
}

export interface EventTemplateData extends BaseTemplateData {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export interface PasswordSuccessTemplateData extends BaseTemplateData {
  loginUrl: string;
}

export interface DeaconessAppointmentData extends BaseTemplateData {
  appointmentDate: string;
}

export interface NewMembershipApplicationData extends BaseTemplateData {
  applicationStatus: string;
}

export type EmailTemplateData =
  | WelcomeTemplateData
  | RoleUpdateTemplateData
  | AnnouncementTemplateData
  | EventTemplateData
  | PasswordResetTemplateData
  | PasswordSuccessTemplateData
  | DeaconessAppointmentData
  | NewMembershipApplicationData;

export interface EmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: EmailTemplateData;
} 