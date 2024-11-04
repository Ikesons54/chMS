import { IUser } from '../models/User';

declare global {
  namespace Express {
    // Extend Express Request interface to include user property
    interface Request {
      user?: IUser | null;
    }
  }
}

// This empty export is required to make the file a module
export {};
