"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToExcel = exports.getCustomDateRangeReport = exports.getIndividualTitherTrends = exports.getTitherAnalyticsReport = exports.getAnnualTitheSummaryReport = void 0;
const Donation_1 = require("../models/Donation");
const date_fns_1 = require("date-fns");
const exceljs_1 = __importDefault(require("exceljs"));
function isPopulatedDonation(donation) {
    var _a, _b;
    return ((_a = donation === null || donation === void 0 ? void 0 : donation.donor) === null || _a === void 0 ? void 0 : _a.firstName) !== undefined
        && ((_b = donation === null || donation === void 0 ? void 0 : donation.donor) === null || _b === void 0 ? void 0 : _b.lastName) !== undefined;
}
const getAnnualTitheSummaryReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const startDate = (0, date_fns_1.startOfYear)(new Date(year));
        const endDate = (0, date_fns_1.endOfYear)(new Date(year));
        const tithes = yield Donation_1.Donation.find({
            type: 'tithe',
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('donor', 'firstName lastName');
        const populatedTithes = tithes.filter(isPopulatedDonation);
        // Generate monthly summaries
        const monthlyData = (0, date_fns_1.eachMonthOfInterval)({
            start: startDate,
            end: endDate
        }).map(monthDate => {
            const monthTithes = populatedTithes.filter(tithe => (0, date_fns_1.format)(tithe.date, 'MMM yyyy') === (0, date_fns_1.format)(monthDate, 'MMM yyyy'));
            const summary = {
                month: (0, date_fns_1.format)(monthDate, 'MMM yyyy'),
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
            uniqueTithers: new Set(tithes.map(t => { var _a; return (_a = t.donor) === null || _a === void 0 ? void 0 : _a._id.toString(); })).size,
            averageMonthlyTithe: monthlyData.reduce((sum, m) => sum + m.total, 0) / 12,
            highestMonth: monthlyData.reduce((max, m) => m.total > max.total ? m : max, monthlyData[0]),
            lowestMonth: monthlyData.reduce((min, m) => m.total < min.total ? m : min, monthlyData[0])
        };
        res.status(200).json({
            status: 'success',
            data: {
                year,
                monthlyData,
                annualStats
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAnnualTitheSummaryReport = getAnnualTitheSummaryReport;
const getTitherAnalyticsReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const startDate = (0, date_fns_1.startOfYear)(new Date(year));
        const endDate = (0, date_fns_1.endOfYear)(new Date(year));
        const tithes = yield Donation_1.Donation.find({
            type: 'tithe',
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('donor', 'firstName lastName');
        // Group tithes by donor
        const titherGroups = tithes.reduce((groups, tithe) => {
            var _a;
            const donorId = (_a = tithe.donor) === null || _a === void 0 ? void 0 : _a._id.toString();
            if (!groups[donorId]) {
                groups[donorId] = [];
            }
            groups[donorId].push(tithe);
            return groups;
        }, {});
        // Calculate analytics for each tither
        const titherAnalytics = Object.entries(titherGroups)
            .map(([userId, userTithes]) => {
            const monthsWithTithes = new Set(userTithes.map(t => (0, date_fns_1.format)(t.date, 'MMM yyyy')));
            const allMonths = (0, date_fns_1.eachMonthOfInterval)({
                start: startDate,
                end: endDate
            }).map(date => (0, date_fns_1.format)(date, 'MMM yyyy'));
            const monthsMissed = allMonths.filter(month => !monthsWithTithes.has(month));
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
                    averageConsistency: titherAnalytics.reduce((sum, t) => sum + t.consistency, 0) /
                        titherAnalytics.length,
                    topTithers: titherAnalytics.slice(0, 10)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTitherAnalyticsReport = getTitherAnalyticsReport;
const getIndividualTitherTrends = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, startDate, endDate } = req.query;
        const tithes = yield Donation_1.Donation.find({
            type: 'tithe',
            donor: userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: 1 });
        const monthlyTrends = tithes.reduce((acc, tithe) => {
            const monthYear = (0, date_fns_1.format)(tithe.date, 'MMM yyyy');
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
            consistency: calculateConsistency(tithes, startDate, endDate)
        };
        res.status(200).json({
            status: 'success',
            data: { trends }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getIndividualTitherTrends = getIndividualTitherTrends;
const getCustomDateRangeReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;
        const tithes = yield Donation_1.Donation.find({
            type: 'tithe',
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('donor', 'firstName lastName');
        const groupedData = groupTithesByPeriod(tithes, groupBy);
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
    }
    catch (error) {
        next(error);
    }
});
exports.getCustomDateRangeReport = getCustomDateRangeReport;
const exportToExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const tithes = yield Donation_1.Donation.find({
            type: 'tithe',
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('donor', 'firstName lastName');
        const populatedTithes = tithes.filter(isPopulatedDonation);
        const workbook = new exceljs_1.default.Workbook();
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
                (0, date_fns_1.format)(tithe.date, 'dd/MM/yyyy'),
                `${tithe.donor.firstName} ${tithe.donor.lastName}`,
                tithe.amount,
                tithe.receiptNumber,
                tithe.paymentMethod
            ]);
        });
        // Style the worksheet
        worksheet.getRow(1).font = { bold: true };
        worksheet.columns.forEach(column => {
            column.width = 15;
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=tithe-report-${(0, date_fns_1.format)(new Date(), 'yyyy-MM-dd')}.xlsx`);
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(error);
    }
});
exports.exportToExcel = exportToExcel;
// Helper functions
const calculateGrowthRate = (tithes) => {
    if (tithes.length < 2)
        return 0;
    const firstMonth = tithes[0].amount;
    const lastMonth = tithes[tithes.length - 1].amount;
    return ((lastMonth - firstMonth) / firstMonth) * 100;
};
const calculateConsistency = (tithes, startDate, endDate) => {
    const monthsWithTithes = new Set(tithes.map(t => (0, date_fns_1.format)(t.date, 'MMM yyyy')));
    const allMonths = (0, date_fns_1.eachMonthOfInterval)({
        start: new Date(startDate),
        end: new Date(endDate)
    }).map(date => (0, date_fns_1.format)(date, 'MMM yyyy'));
    return (monthsWithTithes.size / allMonths.length) * 100;
};
const groupTithesByPeriod = (tithes, groupBy) => {
    return tithes.reduce((acc, tithe) => {
        const key = groupBy === 'month'
            ? (0, date_fns_1.format)(tithe.date, 'MMM yyyy')
            : (0, date_fns_1.format)(tithe.date, groupBy === 'week' ? 'wo yyyy' : 'yyyy');
        if (!acc[key]) {
            acc[key] = {
                total: 0,
                count: 0,
                tithes: []
            };
        }
        acc[key].total += tithe.amount;
        acc[key].count++;
        acc[key].tithes.push(tithe);
        return acc;
    }, {});
};
const calculateStatistics = (tithes) => {
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
const analyzeTrends = (groupedData) => {
    const periods = Object.keys(groupedData).sort();
    const totals = periods.map(period => groupedData[period].total);
    return {
        growthRate: calculateGrowthRate(totals),
        volatility: calculateVolatility(totals),
        seasonality: detectSeasonality(groupedData)
    };
};
const calculateMedian = (numbers) => {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
};
const calculateStandardDeviation = (numbers) => {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, num) => sum + num, 0) / numbers.length;
    return Math.sqrt(avgSquareDiff);
};
const calculateVolatility = (numbers) => {
    return calculateStandardDeviation(numbers) /
        (numbers.reduce((sum, num) => sum + num, 0) / numbers.length) * 100;
};
const detectSeasonality = (groupedData) => {
    const monthlyAverages = {};
    Object.entries(groupedData).forEach(([period, data]) => {
        const month = period.split(' ')[0];
        if (!monthlyAverages[month]) {
            monthlyAverages[month] = { sum: 0, count: 0 };
        }
        monthlyAverages[month].sum += data.total;
        monthlyAverages[month].count++;
    });
    return Object.entries(monthlyAverages).reduce((acc, [month, data]) => {
        acc[month] = data.sum / data.count;
        return acc;
    }, {});
};
