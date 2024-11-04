import { Request, Response, NextFunction } from 'express';
import { Donation, IDonation } from '../models/Donation';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import ExcelJS, { Column as ExcelColumn } from 'exceljs';
import { Stream } from 'stream';
import { Document, Types } from 'mongoose';

interface MonthlyTitheSummary {
  month: string;
  total: number;
  count: number;
  uniqueTithers: number;
  averageTithe: number;
}

interface TitherAnalytics {
  userId: string;
  name: string;
  totalTithes: number;
  frequency: number;
  averageTithe: number;
  lastTitheDate: Date;
  consistency: number;
  monthsMissed: string[];
}

interface PopulatedDonor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface PopulatedDonation extends Omit<IDonation, 'donor'> {
  donor: PopulatedDonor;
}

interface TrendAnalysis {
  growthRate: number;
  volatility: number;
  seasonality: Record<string, number>;
}

function isPopulatedDonation(donation: any): donation is PopulatedDonation {
  return donation?.donor?.firstName !== undefined 
    && donation?.donor?.lastName !== undefined;
}

export const getAnnualTitheSummaryReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startDate = startOfYear(new Date(year as string));
    const endDate = endOfYear(new Date(year as string));

    const tithes = await Donation.find({
      type: 'tithe',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate<{ donor: PopulatedDonor }>('donor', 'firstName lastName');

    const populatedTithes = tithes.filter(isPopulatedDonation);

    // Generate monthly summaries
    const monthlyData = eachMonthOfInterval({
      start: startDate,
      end: endDate
    }).map(monthDate => {
      const monthTithes = populatedTithes.filter(tithe => 
        format(tithe.date, 'MMM yyyy') === format(monthDate, 'MMM yyyy')
      );

      const summary: MonthlyTitheSummary = {
        month: format(monthDate, 'MMM yyyy'),
        total: monthTithes.reduce((sum, t) => sum + t.amount, 0),
        count: monthTithes.length,
        uniqueTithers: new Set(monthTithes.map(t => t.donor._id.toString())).size,
        averageTithe: monthTithes.length ? 
          monthTithes.reduce((sum, t) => sum + t.amount, 0) / monthTithes.length : 
          0
      };
      return summary;
    });

    // Calculate annual statistics
    const annualStats = {
      totalTithes: tithes.reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: tithes.length,
      uniqueTithers: new Set(tithes.map(t => t.donor?._id.toString())).size,
      averageMonthlyTithe: monthlyData.reduce((sum, m) => sum + m.total, 0) / 12,
      highestMonth: monthlyData.reduce((max, m) => 
        m.total > max.total ? m : max, monthlyData[0]),
      lowestMonth: monthlyData.reduce((min, m) => 
        m.total < min.total ? m : min, monthlyData[0])
    };

    res.status(200).json({
      status: 'success',
      data: {
        year,
        monthlyData,
        annualStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTitherAnalyticsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startDate = startOfYear(new Date(year as string));
    const endDate = endOfYear(new Date(year as string));

    const tithes = await Donation.find({
      type: 'tithe',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('donor', 'firstName lastName');

    // Group tithes by donor
    const titherGroups = tithes.reduce((groups: Record<string, any[]>, tithe) => {
      const donorId = tithe.donor?._id.toString();
      if (!groups[donorId]) {
        groups[donorId] = [];
      }
      groups[donorId].push(tithe);
      return groups;
    }, {});

    // Calculate analytics for each tither
    const titherAnalytics: TitherAnalytics[] = Object.entries(titherGroups)
      .map(([userId, userTithes]) => {
        const monthsWithTithes = new Set(
          userTithes.map(t => format(t.date, 'MMM yyyy'))
        );

        const allMonths = eachMonthOfInterval({
          start: startDate,
          end: endDate
        }).map(date => format(date, 'MMM yyyy'));

        const monthsMissed = allMonths.filter(
          month => !monthsWithTithes.has(month)
        );

        return {
          userId,
          name: `${userTithes[0].donor.firstName} ${userTithes[0].donor.lastName}`,
          totalTithes: userTithes.reduce((sum, t) => sum + t.amount, 0),
          frequency: userTithes.length,
          averageTithe: userTithes.reduce((sum, t) => sum + t.amount, 0) / userTithes.length,
          lastTitheDate: new Date(Math.max(...userTithes.map(t => t.date.getTime()))),
          consistency: (monthsWithTithes.size / 12) * 100,
          monthsMissed
        };
      })
      .sort((a, b) => b.totalTithes - a.totalTithes);

    res.status(200).json({
      status: 'success',
      data: {
        year,
        titherAnalytics,
        summary: {
          totalTithers: titherAnalytics.length,
          averageConsistency: 
            titherAnalytics.reduce((sum, t) => sum + t.consistency, 0) / 
            titherAnalytics.length,
          topTithers: titherAnalytics.slice(0, 10)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIndividualTitherTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const tithes = await Donation.find({
      type: 'tithe',
      donor: userId,
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).sort({ date: 1 });

    const monthlyTrends = tithes.reduce((acc: Record<string, number>, tithe: any) => {
      const monthYear = format(tithe.date, 'MMM yyyy');
      acc[monthYear] = (acc[monthYear] || 0) + tithe.amount;
      return acc;
    }, {});

    const trends = {
      totalAmount: tithes.reduce((sum, t) => sum + t.amount, 0),
      averageAmount: tithes.length ? 
        tithes.reduce((sum, t) => sum + t.amount, 0) / tithes.length : 
        0,
      monthlyTrends,
      growthRate: calculateGrowthRate(tithes),
      consistency: calculateConsistency(tithes, startDate as string, endDate as string)
    };

    res.status(200).json({
      status: 'success',
      data: { trends }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomDateRangeReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const tithes = await Donation.find({
      type: 'tithe',
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).populate('donor', 'firstName lastName');

    const groupedData = groupTithesByPeriod(tithes, groupBy as string);
    const statistics = calculateStatistics(tithes);
    const trends = analyzeTrends(groupedData);

    res.status(200).json({
      status: 'success',
      data: {
        groupedData,
        statistics,
        trends
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const tithes = await Donation.find({
      type: 'tithe',
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).populate<{ donor: PopulatedDonor }>('donor', 'firstName lastName');

    const populatedTithes = tithes.filter(isPopulatedDonation);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tithe Report');

    // Add headers
    worksheet.addRow([
      'Date',
      'Donor Name',
      'Amount',
      'Receipt Number',
      'Payment Method'
    ]);

    // Add data with proper typing
    populatedTithes.forEach(tithe => {
      worksheet.addRow([
        format(tithe.date, 'dd/MM/yyyy'),
        `${tithe.donor.firstName} ${tithe.donor.lastName}`,
        tithe.amount,
        tithe.receiptNumber,
        tithe.paymentMethod
      ]);
    });

    // Style the worksheet with proper typing
    worksheet.getRow(1).font = { bold: true };
    
    // Fix the column typing
    worksheet.columns.forEach((column: Partial<ExcelJS.Column>) => {
      if (column) {
        column.width = 15;
      }
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tithe-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// Helper functions
const calculateGrowthRate = (tithes: Document[]): number => {
  if (tithes.length < 2) return 0;
  
  const firstMonth = (tithes[0] as any).amount;
  const lastMonth = (tithes[tithes.length - 1] as any).amount;
  return ((lastMonth - firstMonth) / firstMonth) * 100;
};

const calculateConsistency = (
  tithes: Document[],
  startDate: string,
  endDate: string
): number => {
  const monthsWithTithes = new Set(
    tithes.map(t => format((t as any).date, 'MMM yyyy'))
  );

  const allMonths = eachMonthOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  }).map(date => format(date, 'MMM yyyy'));

  return (monthsWithTithes.size / allMonths.length) * 100;
};

const groupTithesByPeriod = (tithes: Document[], groupBy: string) => {
  return tithes.reduce((acc: Record<string, any>, tithe) => {
    const key = groupBy === 'month' 
      ? format((tithe as any).date, 'MMM yyyy')
      : format((tithe as any).date, groupBy === 'week' ? 'wo yyyy' : 'yyyy');
    
    if (!acc[key]) {
      acc[key] = {
        total: 0,
        count: 0,
        tithes: []
      };
    }
    
    acc[key].total += (tithe as any).amount;
    acc[key].count++;
    acc[key].tithes.push(tithe);
    
    return acc;
  }, {});
};

const calculateStatistics = (tithes: any[]) => {
  const amounts = tithes.map(t => t.amount);
  return {
    total: amounts.reduce((sum, amount) => sum + amount, 0),
    average: amounts.length ? 
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 
      0,
    median: calculateMedian(amounts),
    standardDeviation: calculateStandardDeviation(amounts)
  };
};

const analyzeTrends = (groupedData: Record<string, any>): TrendAnalysis => {
  const periods = Object.keys(groupedData).sort();
  const totals = periods.map(period => groupedData[period].total);
  
  return {
    growthRate: calculateGrowthRate(totals),
    volatility: calculateVolatility(totals),
    seasonality: detectSeasonality(groupedData)
  };
};

const calculateMedian = (numbers: number[]): number => {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

const calculateStandardDeviation = (numbers: number[]): number => {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, num) => sum + num, 0) / numbers.length;
  return Math.sqrt(avgSquareDiff);
};

const calculateVolatility = (numbers: number[]): number => {
  return calculateStandardDeviation(numbers) / 
    (numbers.reduce((sum, num) => sum + num, 0) / numbers.length) * 100;
};

const detectSeasonality = (groupedData: Record<string, any>): Record<string, number> => {
  const monthlyAverages: Record<string, { sum: number; count: number }> = {};
  
  Object.entries(groupedData).forEach(([period, data]: [string, any]) => {
    const month = period.split(' ')[0];
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = { sum: 0, count: 0 };
    }
    monthlyAverages[month].sum += data.total;
    monthlyAverages[month].count++;
  });
  
  return Object.entries(monthlyAverages).reduce((acc: Record<string, number>, [month, data]) => {
    acc[month] = data.sum / data.count;
    return acc;
  }, {});
};