import express from 'express';
import { emailService } from '../services/emailService';

// Define interfaces for our request types
interface NewsletterArticle {
  title: string;
  excerpt: string;
  readMoreLink: string;
}

interface UpcomingEvent {
  name: string;
  date: string;
  location: string;
  registrationLink: string;
}

interface NewsletterRequest {
  recipients: string[];
  newsletterTitle: string;
  articles: NewsletterArticle[];
  upcomingEvents: UpcomingEvent[];
  unsubscribeLink: string;
}

interface NotificationRequest {
  email: string;
  notificationTitle: string;
  message: string;
  additionalDetails?: string;
  actionRequired?: string;
  actionLink?: string;
  actionText?: string;
}

const router = express.Router();

router.post('/test-email', async (req, res) => {
  try {
    const result = await emailService.sendEmail({
      to: 'ikesonoffei54@gmail.com', // Your test email
      template: 'test',  // We'll create this template
      subject: 'Test Email from COP Abu Dhabi App',
      data: {
        type: 'test',
        name: 'Test User',
        message: 'This is a test email from the COP Abu Dhabi application.'
      }
    });

    if (result) {
      res.status(200).json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send test email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error sending test email', error });
  }
});

router.post('/event-registration', async (req, res) => {
  try {
    const {
      email,
      name,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      registrationId,
      calendarLink
    } = req.body;

    const result = await emailService.sendEmail({
      to: email,
      template: 'eventRegistration',
      subject: `Registration Confirmed: ${eventName}`,
      data: {
        name,
        eventName,
        eventDate,
        eventTime,
        eventLocation,
        registrationId,
        calendarLink
      }
    });

    if (result) {
      res.status(200).json({ 
        message: 'Event registration email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send event registration email' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending event registration email', 
      error 
    });
  }
});

router.post('/send-newsletter', async (req, res) => {
  try {
    const {
      recipients,
      newsletterTitle,
      articles,
      upcomingEvents,
      unsubscribeLink
    }: NewsletterRequest = req.body;

    // Send to each recipient with explicit typing
    const results = await Promise.all(
      recipients.map((email: string) => 
        emailService.sendEmail({
          to: email,
          template: 'newsletter',
          subject: `COP Abu Dhabi: ${newsletterTitle}`,
          data: {
            newsletterTitle,
            articles,
            upcomingEvents,
            unsubscribeLink
          }
        })
      )
    );

    const successCount = results.filter(Boolean).length;

    res.status(200).json({
      message: `Newsletter sent successfully to ${successCount} recipients`,
      totalRecipients: recipients.length,
      successCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error sending newsletter',
      error
    });
  }
});

router.post('/send-notification', async (req, res) => {
  try {
    const {
      email,
      notificationTitle,
      message,
      additionalDetails,
      actionRequired,
      actionLink,
      actionText
    }: NotificationRequest = req.body;

    const result = await emailService.sendEmail({
      to: email,
      template: 'notification',
      subject: `COP Abu Dhabi: ${notificationTitle}`,
      data: {
        notificationTitle,
        message,
        additionalDetails,
        actionRequired,
        actionLink,
        actionText
      }
    });

    if (result) {
      res.status(200).json({ 
        message: 'Notification email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send notification email' 
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error sending notification email',
      error
    });
  }
});

export default router; 