import { Request, Response, NextFunction } from 'express';
import { Donation, DonationType } from '../models/Donation';
import { AppError } from '../middleware/errorHandler';
import { generatePDF, PDFTemplateData, PDFDonor } from '../utils/pdfGenerator';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { Tithe } from '../models/Tithe';

export const getTitheDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Get all tithes for the year
    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31);

    const tithes = await Donation.find({
      type: DonationType.TITHE,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    // Calculate monthly totals
    const monthlyTotals = Array(12).fill(0);
    tithes.forEach(tithe => {
      const month = new Date(tithe.date).getMonth();
      monthlyTotals[month] += tithe.amount;
    });

    // Get unique tithe payers
    const uniqueTithePayers = new Set(
      tithes.map(tithe => tithe.titheDetails?.titheOwner)
    );

    // Calculate trends
    const monthlyGrowth = monthlyTotals.map((total, index) => {
      if (index === 0) return 0;
      const previousMonth = monthlyTotals[index - 1];
      return previousMonth ? ((total - previousMonth) / previousMonth) * 100 : 0;
    });

    // Get recent tithes
    const recentTithes = await Donation.find({
      type: DonationType.TITHE
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('recordedBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: {
        yearlyTotal: monthlyTotals.reduce((a, b) => a + b, 0),
        monthlyTotals,
        monthlyGrowth,
        uniqueTithePayers: uniqueTithePayers.size,
        recentTithes,
        averageMonthlyTithe: monthlyTotals.reduce((a, b) => a + b, 0) / 12,
        statistics: {
          totalTransactions: tithes.length,
          averageTitheAmount: tithes.length ? 
            monthlyTotals.reduce((a, b) => a + b, 0) / tithes.length : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTitheStatement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titheOwner, year, month } = req.query;
    
    if (!titheOwner) {
      return next(new AppError('Tithe owner is required', 400));
    }

    // Convert titheOwner to ObjectId
    const titheOwnerId = new Types.ObjectId(titheOwner as string);

    const startDate = month ? 
      new Date(Number(year), Number(month) - 1, 1) :
      new Date(Number(year), 0, 1);
    
    const endDate = month ?
      new Date(Number(year), Number(month), 0) :
      new Date(Number(year), 11, 31);

    const tithes = await Donation.find({
      type: DonationType.TITHE,
      'titheDetails.titheOwner': titheOwnerId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('titheDetails.titheOwner', 'firstName lastName memberId')
    .sort({ date: 1 });

    const donorDetails = await User.findById(titheOwnerId)
      .select('firstName lastName memberId');

    if (!donorDetails) {
      return next(new AppError('Donor details not found', 404));
    }

    const statement = {
      titheOwner: `${donorDetails.firstName} ${donorDetails.lastName} (${donorDetails.memberId})`,
      period: month ? 
        `${new Date(startDate).toLocaleString('default', { month: 'long' })} ${year}` :
        `Year ${year}`,
      tithes: tithes.map(tithe => ({
        date: tithe.date.toLocaleDateString(),
        amount: tithe.amount,
        receiptNumber: tithe.receiptNumber,
        paidBy: tithe.titheDetails?.personPaying ? 
          `${(tithe.titheDetails.personPaying as any).firstName} ${(tithe.titheDetails.personPaying as any).lastName} (${(tithe.titheDetails.personPaying as any).memberId})` : 
          'Self'
      })),
      totalAmount: tithes.reduce((sum, tithe) => sum + tithe.amount, 0),
      generatedDate: new Date().toLocaleDateString(),
      churchDetails: {
        name: 'Church of Pentecost Abu Dhabi',
        address: 'Abu Dhabi, UAE'
      }
    };

    // Create PDF data with proper typing
    const pdfData: PDFTemplateData = {
      donation: {
        amount: statement.totalAmount,
        type: 'Tithe',
        donor: {
          _id: titheOwnerId,
          firstName: donorDetails.firstName,
          lastName: donorDetails.lastName,
          memberId: donorDetails.memberId
        } as PDFDonor,
        date: new Date(),
        receiptNumber: tithes[0]?.receiptNumber || '',
        paymentMethod: tithes[0]?.paymentMethod || 'N/A',
        titheDetails: {
          titheOwner: titheOwnerId,
          personPaying: tithes[0]?.titheDetails?.personPaying
        }
      },
      date: new Date().toLocaleDateString(),
      churchDetails: {
        name: 'Church of Pentecost Abu Dhabi',
        address: 'Abu Dhabi, UAE',
        phone: '+971543927658',
        email: 'info@copabudhabi.org'
      }
    };

   

    // Save the PDF to a file (optional)
    // const pdfPath = path.join(__dirname, `../../public/statements/tithe-${titheOwnerId.toString()}-${year}${month ? '-' + month : ''}.pdf`);
    // fs.writeFileSync(pdfPath, pdfBuffer);

    // Send both PDF and JSON response
    res.status(200).json({
      status: 'success',
      data: {
        statement,
        pdfUrl: `/statements/tithe-${titheOwnerId.toString()}-${year}${month ? '-' + month : ''}.pdf`
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTitheAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalTithes = await Tithe.countDocuments();
    const totalAmount = await Tithe.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const averageTithe = totalAmount[0]?.total / totalTithes || 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalTithes,
        totalAmount: totalAmount[0]?.total || 0,
        averageTithe
      }
    });
  } catch (error) {
    next(error);
  }
};