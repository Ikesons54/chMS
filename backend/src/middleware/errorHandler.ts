import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  _req: Request, // Prefixed with underscore to indicate intentionally unused
  res: Response,
  _next: NextFunction // Prefixed with underscore to indicate intentionally unused
) => {
  // Set default values for statusCode and status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development mode: detailed error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production mode: sanitized error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Log the error for internal tracking
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};

export const handleUnhandledRejections = (err: any) => {
  console.error('UNHANDLED REJECTION 💥', err);
  process.exit(1); // Exit the process with failure
};

export const handleUnhandledExceptions = (err: any) => {
  console.error('UNHANDLED EXCEPTION 💥', err);
  process.exit(1); // Exit the process with failure
};

process.on('unhandledRejection', handleUnhandledRejections);
process.on('uncaughtException', handleUnhandledExceptions); 