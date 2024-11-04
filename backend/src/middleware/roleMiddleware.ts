import { Request, Response, NextFunction } from 'express';
import { UserRole, RolePermissions, Permission, IUser } from '../models/User';
import { AppError } from './errorHandler';

// Define the AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user?: IUser | undefined;
}

// Single hasRole function (removed duplicate)
export const hasRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const hasPermission = (requiredPermission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = RolePermissions[userRole];

    if (!userPermissions.includes(requiredPermission)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};