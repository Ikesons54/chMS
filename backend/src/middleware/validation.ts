import { Request, Response, NextFunction } from 'express';
import { ReportFrequency, ReportType } from '../models/Schedule';
import { DonationType, PaymentMethod, FundraisingCampaign } from '../models/Donation';
import mongoose from 'mongoose';

interface ValidationError {
  field: string;
  message: string;
}

export const validateSchedule = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const { name, reportType, frequency, recipients, parameters } = req.body;

  // Validate required fields
  if (!name?.trim()) {
    errors.push({ field: 'name', message: 'Schedule name is required' });
  }

  if (!reportType || !Object.values(ReportType).includes(reportType)) {
    errors.push({ field: 'reportType', message: 'Valid report type is required' });
  }

  if (!frequency || !Object.values(ReportFrequency).includes(frequency)) {
    errors.push({ field: 'frequency', message: 'Valid frequency is required' });
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    errors.push({ field: 'recipients', message: 'At least one recipient is required' });
  } else {
    // Validate each recipient ID
    recipients.forEach((id, index) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        errors.push({ field: `recipients[${index}]`, message: 'Invalid recipient ID' });
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

export const validateDonation = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const {
    amount,
    type,
    donor,
    paymentMethod,
    titheDetails,
    fundraisingDetails
  } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    errors.push({ field: 'amount', message: 'Valid amount is required' });
  }

  // Validate type
  if (!type || !Object.values(DonationType).includes(type)) {
    errors.push({ field: 'type', message: 'Valid donation type is required' });
  }

  // Validate donor
  if (!donor || !mongoose.Types.ObjectId.isValid(donor)) {
    errors.push({ field: 'donor', message: 'Valid donor ID is required' });
  }

  // Validate payment method
  if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Valid payment method is required' });
  }

  // Validate tithe details if type is tithe
  if (type === DonationType.TITHE && titheDetails) {
    if (!titheDetails.titheOwner || !mongoose.Types.ObjectId.isValid(titheDetails.titheOwner)) {
      errors.push({ field: 'titheDetails.titheOwner', message: 'Valid tithe owner ID is required' });
    }
  }

  // Validate fundraising details if type is fundraising
  if (type === DonationType.FUNDRAISING && fundraisingDetails) {
    if (!fundraisingDetails.campaign || !Object.values(FundraisingCampaign).includes(fundraisingDetails.campaign)) {
      errors.push({ field: 'fundraisingDetails.campaign', message: 'Valid fundraising campaign is required' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
}; 