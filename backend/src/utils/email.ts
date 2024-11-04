import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { logger } from './logger';

interface EmailTemplate {
  name: string;
  verificationURL?: string;
  resetURL?: string;
  [key: string]: any;
}

interface EmailOptions {
  email: string;
  subject: string;
  template: 'verifyEmail' | 'resetPassword' | 'welcome';
  data: EmailTemplate;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(
      __dirname,
      '../templates/emails',
      `${templateName}.hbs`
    );
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private async compileTemplate(template: string, data: EmailTemplate): Promise<string> {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  public async sendEmail({ email, subject, template, data }: EmailOptions): Promise<void> {
    try {
      // Load and compile template
      const templateContent = await this.loadTemplate(template);
      const html = await this.compileTemplate(templateContent, data);

      // Send email
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        html,
      });

      logger.info(`Email sent successfully to ${email}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export const sendEmail = emailService.sendEmail.bind(emailService); 