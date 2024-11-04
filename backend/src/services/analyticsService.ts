import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const emailAnalyticsSchema = new mongoose.Schema({
  emailId: String,
  recipient: String,
  opened: { type: Boolean, default: false },
  openedAt: Date,
  clicked: { type: Boolean, default: false },
  clickedLinks: [String],
  deliveryStatus: {
    type: String,
    enum: ['delivered', 'bounced', 'failed'],
    default: 'delivered'
  },
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const EmailAnalytics = mongoose.model('EmailAnalytics', emailAnalyticsSchema);

class AnalyticsService {
  async trackEmailOpen(emailId: string, recipient: string) {
    try {
      await EmailAnalytics.findOneAndUpdate(
        { emailId, recipient },
        { 
          opened: true,
          openedAt: new Date()
        },
        { upsert: true }
      );
      logger.info(`Email ${emailId} opened by ${recipient}`);
    } catch (error) {
      logger.error('Failed to track email open:', error);
    }
  }

  async trackEmailClick(emailId: string, recipient: string, link: string) {
    try {
      await EmailAnalytics.findOneAndUpdate(
        { emailId, recipient },
        { 
          clicked: true,
          $addToSet: { clickedLinks: link }
        },
        { upsert: true }
      );
      logger.info(`Email ${emailId} link clicked by ${recipient}`);
    } catch (error) {
      logger.error('Failed to track email click:', error);
    }
  }

  async getEmailStats(emailId: string) {
    try {
      const stats = await EmailAnalytics.aggregate([
        { $match: { emailId } },
        {
          $group: {
            _id: null,
            totalOpens: { $sum: { $cond: ['$opened', 1, 0] } },
            totalClicks: { $sum: { $cond: ['$clicked', 1, 0] } },
            uniqueRecipients: { $addToSet: '$recipient' }
          }
        }
      ]);
      return stats[0] || { totalOpens: 0, totalClicks: 0, uniqueRecipients: [] };
    } catch (error) {
      logger.error('Failed to get email stats:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 