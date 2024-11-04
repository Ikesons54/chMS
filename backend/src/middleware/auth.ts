import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { IUser, User } from '@/models/User';

interface JwtCustomPayload extends JwtPayload {
  userId: string; // Adjust this based on your JWT payload structure
  email: string;  // Include any other fields you expect
  role: string;   // Example: user role
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser | undefined; // Change to IUser | undefined
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtCustomPayload;

    // Fetch the user from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user; // Assign the complete user object to req.user
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
};