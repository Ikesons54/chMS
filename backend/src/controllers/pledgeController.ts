import { Request, Response, NextFunction } from 'express';
import { Pledge } from '../models/Pledge';

export const createPledge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pledge = await Pledge.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        pledge
      }
    });
  } catch (error) {
    next(error);
  }
}; 