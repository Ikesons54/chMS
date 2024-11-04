import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string; // Title of the notification
  message: string; // Notification message
  recipient: mongoose.Types.ObjectId; // User to whom the notification is sent
  isRead: boolean; // Status of the notification
  createdAt: Date; // Timestamp of when the notification was created
}

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema); 