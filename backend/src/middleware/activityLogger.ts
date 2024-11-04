import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const logActivity = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    const activity = {
      action: req.method + ' ' + req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        body: req.body,
        params: req.params,
        query: req.query
      }
    };

    await User.findById(req.user._id).then(user => {
      if (user) {
        user.logActivity(activity);
      }
    });
  }
  next();
}; 