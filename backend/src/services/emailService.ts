import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { ReportType } from '../models/Schedule';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

interface EmailData {
  type: string;
  name: string;
  reportType: ReportType;
  startDate?: string;
  endDate: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private templates: Record<string, HandlebarsTemplateDelegate> = {};
  private initialized: boolean = false;
  private initializationAttempts: number = 0;
  private readonly MAX_INIT_ATTEMPTS = 3;

  constructor() {
    this.initialize().catch((error: Error) => {
      logger.error('Email service initialization failed:', error);
    });
  }

  private async initialize(): Promise<void> {
    try {
      this.initializationAttempts++;
      await this.initializeTemplates();
      await this.createTransporter();
      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Email service initialization attempt ${this.initializationAttempts} failed:`, errorMessage);
      
      if (this.initializationAttempts < this.MAX_INIT_ATTEMPTS) {
        const delay = this.initializationAttempts * 1000; // Exponential backoff
        logger.info(`Retrying initialization in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initialize();
      }
      
      throw new Error('Email service initialization failed after multiple attempts');
    }
  }

  private async createTransporter(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });

      // Verify connection
      await this.transporter.verify();
      logger.info('Email transporter created successfully');
    } catch (error) {
      logger.error('Failed to create email transporter:', error);
      throw error;
    }
  }

  private async initializeTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(__dirname, '../templates/emails');
      
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
        logger.info('Created templates directory');
      }

      const templateFiles = fs.readdirSync(templatesDir);
      
      if (templateFiles.length === 0) {
        logger.warn('No email templates found in templates directory');
      }

      templateFiles.forEach(file => {
        if (path.extname(file) === '.hbs') {
          const templateName = path.parse(file).name;
          const templateContent = fs.readFileSync(
            path.join(templatesDir, file),
            'utf-8'
          );
          this.templates[templateName] = handlebars.compile(templateContent);
          logger.info(`Loaded email template: ${templateName}`);
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email templates:', error);
      throw new Error('Email templates initialization failed');
    }
  }

  private getEmailSubject(type: string): string {
    const subjects: Record<string, string> = {
      welcome: 'Welcome to COP Abu Dhabi!',
      newMembershipApplication: 'New Membership Application Received',
      applicationApproved: 'Your Membership Application has been Approved',
      applicationRejected: 'Update on Your Membership Application',
      passwordReset: 'Password Reset Request',
      emailVerification: 'Verify Your Email Address',
      eventReminder: 'Upcoming Event Reminder',
      donationReceipt: 'Thank You for Your Donation',
      scheduledReport: 'Your Scheduled Report is Ready',
      titheReport: 'Tithe Report',
      membershipReport: 'Membership Report'
    };

    return subjects[type] || 'COP Abu Dhabi Notification';
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('Attempting to send email while service is not initialized');
      return false;
    }

    try {
      const template = this.templates[options.template];
      if (!template) {
        throw new Error(`Template ${options.template} not found`);
      }

      const html = template(options.data);

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'COP Abu Dhabi'} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: this.getEmailSubject(options.data.type),
        html,
        attachments: options.attachments
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  public async sendBulkEmail(
    recipients: string[],
    template: string,
    data: EmailData
  ): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('Attempting to send bulk email while service is not initialized');
      return false;
    }

    try {
      const results = await Promise.allSettled(
        recipients.map(recipient =>
          this.sendEmail({
            to: recipient,
            template,
            subject: this.getEmailSubject(data.type),
            data,
            attachments: data.attachments
          })
        )
      );

      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;

      logger.info(`Bulk email sent: ${successCount}/${recipients.length} successful`);
      return successCount > 0;
    } catch (error) {
      logger.error('Bulk email sending failed:', error);
      return false;
    }
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.createTransporter();
      }
      await this.transporter.verify();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Email service verification failed:', errorMessage);
      return false;
    }
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();