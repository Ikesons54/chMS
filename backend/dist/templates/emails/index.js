"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
exports.emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to COP Abu Dhabi',
        html: `
      <h1>Welcome ${data.name}!</h1>
      <p>Thank you for joining the Church of Pentecost Abu Dhabi.</p>
      ${data.verificationLink ?
            `<p>Please verify your email by clicking <a href="${data.verificationLink}">here</a></p>`
            : ''}
    `,
    }),
    roleUpdate: (data) => ({
        subject: 'Role Update Notification',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>Your role has been updated to: ${data.newRole}</p>
      <p>This change is effective immediately.</p>
    `,
    }),
    announcementNotification: (data) => ({
        subject: 'New Church Announcement',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>${data.message}</p>
    `,
    }),
    eventNotification: (data) => ({
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
    resetPassword: (data) => ({
        subject: 'Password Reset Request',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>You requested to reset your password.</p>
      <p>Click <a href="${data.resetURL}">here</a> to reset your password.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    }),
    passwordResetSuccess: (data) => ({
        subject: 'Password Reset Successful',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>Your password has been successfully reset.</p>
      <p>If you didn't make this change, please contact us immediately.</p>
    `,
    }),
    passwordUpdateSuccess: (data) => ({
        subject: 'Password Updated Successfully',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>Your password has been successfully updated.</p>
      <p>If you didn't make this change, please contact us immediately.</p>
    `,
    }),
    deaconessAppointment: (data) => ({
        subject: 'Appointment as Deaconess',
        html: `
      <h1>Dear ${data.name},</h1>
      <p>We are pleased to inform you that you have been appointed as a Deaconess in the Church of Pentecost Abu Dhabi.</p>
      <p>This role comes with new responsibilities and privileges in serving the Lord and His church.</p>
      <p>May God grant you wisdom and grace as you serve in this capacity.</p>
      <p>The church leadership will contact you soon regarding your new duties.</p>
      ${data.appointmentDate ?
            `<p>Your appointment is effective from: ${data.appointmentDate}</p>`
            : ''}
      <br>
      <p>Blessings,</p>
      <p>Church Administration</p>
    `,
    }),
    newMembershipApplication: (data) => ({
        subject: 'New Membership Application',
        html: `
      <h1>Hello ${data.name},</h1>
      <p>A new membership application has been submitted by ${data.applicantName}.</p>
      <p>Please review the application at your earliest convenience.</p>
    `
    }),
};
