import { Request, Response, NextFunction } from 'express';
import { Donation, IDonation } from '../models/Donation';
import { AppError } from '../middleware/errorHandler';
import { generatePDF } from '../utils/pdfGenerator';
import { format } from 'date-fns';

export enum DonationType {
  TITHE = 'tithe',
  OFFERING = 'offering',
  SPECIAL_OFFERING = 'special_offering',
  BUILDING_FUND = 'building_fund',
  MISSIONS = 'missions',
  OTHER = 'other'
}

export const recordDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      amount,
      type,
      donor,
      date,
      paymentMethod,
      notes,
      titheDetails
    } = req.body;

    const donation = await Donation.create({
      amount,
      type,
      donor,
      date,
      paymentMethod,
      notes,
      titheDetails,
      receiptNumber: `DON-${Date.now()}`,
      recordedBy: req.user?._id
    });

    await donation.populate('donor', 'firstName lastName email');

    res.status(201).json({
      status: 'success',
      data: { donation }
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiptNumber } = req.params;

    const donation = await Donation.findOne({ receiptNumber })
      .populate('donor', 'firstName lastName email')
      .populate('recordedBy', 'firstName lastName');

    if (!donation) {
      return next(new AppError('Donation receipt not found', 404));
    }

    const pdfData = {
      donation: {
        amount: donation.amount,
        type: donation.type,
        donor: {
          _id: donation.donor._id,
          firstName: (donation.donor as any).firstName,
          lastName: (donation.donor as any).lastName
        },
        date: donation.date,
        receiptNumber: donation.receiptNumber,
        paymentMethod: donation.paymentMethod,
        fundraisingDetails: donation.fundraisingDetails,
        titheDetails: donation.titheDetails
      },
      date: format(donation.date, 'dd/MM/yyyy'),
      churchDetails: {
        name: process.env.CHURCH_NAME || '',
        address: process.env.CHURCH_ADDRESS || '',
        phone: process.env.CHURCH_PHONE || '',
        email: process.env.CHURCH_EMAIL || ''
      }
    };

    const pdfBuffer = await generatePDF('donation-receipt', pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=receipt-${receiptNumber}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const getDonationsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query: Record<string, any> = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (type) query.type = type;

    const donations = await Donation.find(query)
      .populate('donor', 'firstName lastName')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 });

    const summary = {
      total: donations.reduce((sum, d) => sum + d.amount, 0),
      count: donations.length,
      byPaymentMethod: donations.reduce((acc: Record<string, number>, d) => {
        acc[d.paymentMethod] = (acc[d.paymentMethod] || 0) + d.amount;
        return acc;
      }, {})
    };

    res.status(200).json({
      status: 'success',
      data: {
        donations,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDonorHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { donorId } = req.params;
    const { year } = req.query;

    const query: Record<string, any> = { donor: donorId };
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const donations = await Donation.find(query)
      .sort({ date: -1 });

    const summary = {
      totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
      byType: donations.reduce((acc: Record<string, number>, d) => {
        acc[d.type] = (acc[d.type] || 0) + d.amount;
        return acc;
      }, {}),
      yearlyTotals: donations.reduce((acc: Record<string, number>, d) => {
        const year = new Date(d.date).getFullYear().toString();
        acc[year] = (acc[year] || 0) + d.amount;
        return acc;
      }, {})
    };

    res.status(200).json({
      status: 'success',
      data: {
        donations,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTitheReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const tithes = await Donation.find({
      type: DonationType.TITHE,
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).populate('donor', 'firstName lastName');

    const summary = {
      totalTithes: tithes.reduce((sum, t) => sum + t.amount, 0),
      titheCount: tithes.length,
      uniqueTithers: new Set(tithes.map(t => t.donor?._id.toString())).size,
      monthlyTotals: tithes.reduce((acc: Record<string, number>, t) => {
        const monthYear = format(t.date, 'MMM yyyy');
        acc[monthYear] = (acc[monthYear] || 0) + t.amount;
        return acc;
      }, {})
    };

    res.status(200).json({
      status: 'success',
      data: {
        tithes,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
}; 