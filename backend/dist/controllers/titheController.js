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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitheAnalytics = exports.getTitheStatement = exports.getTitheDashboard = void 0;
const Donation_1 = require("../models/Donation");
const errorHandler_1 = require("../middleware/errorHandler");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const Tithe_1 = require("../models/Tithe");
const getTitheDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year = new Date().getFullYear() } = req.query;
        // Get all tithes for the year
        const startDate = new Date(Number(year), 0, 1);
        const endDate = new Date(Number(year), 11, 31);
        const tithes = yield Donation_1.Donation.find({
            type: Donation_1.DonationType.TITHE,
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
        const uniqueTithePayers = new Set(tithes.map(tithe => { var _a; return (_a = tithe.titheDetails) === null || _a === void 0 ? void 0 : _a.titheOwner; }));
        // Calculate trends
        const monthlyGrowth = monthlyTotals.map((total, index) => {
            if (index === 0)
                return 0;
            const previousMonth = monthlyTotals[index - 1];
            return previousMonth ? ((total - previousMonth) / previousMonth) * 100 : 0;
        });
        // Get recent tithes
        const recentTithes = yield Donation_1.Donation.find({
            type: Donation_1.DonationType.TITHE
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
    }
    catch (error) {
        next(error);
    }
});
exports.getTitheDashboard = getTitheDashboard;
const getTitheStatement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { titheOwner, year, month } = req.query;
        if (!titheOwner) {
            return next(new errorHandler_1.AppError('Tithe owner is required', 400));
        }
        // Convert titheOwner to ObjectId
        const titheOwnerId = new mongoose_1.Types.ObjectId(titheOwner);
        const startDate = month ?
            new Date(Number(year), Number(month) - 1, 1) :
            new Date(Number(year), 0, 1);
        const endDate = month ?
            new Date(Number(year), Number(month), 0) :
            new Date(Number(year), 11, 31);
        const tithes = yield Donation_1.Donation.find({
            type: Donation_1.DonationType.TITHE,
            'titheDetails.titheOwner': titheOwnerId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate('titheDetails.titheOwner', 'firstName lastName memberId')
            .sort({ date: 1 });
        const donorDetails = yield User_1.User.findById(titheOwnerId)
            .select('firstName lastName memberId');
        if (!donorDetails) {
            return next(new errorHandler_1.AppError('Donor details not found', 404));
        }
        const statement = {
            titheOwner: `${donorDetails.firstName} ${donorDetails.lastName} (${donorDetails.memberId})`,
            period: month ?
                `${new Date(startDate).toLocaleString('default', { month: 'long' })} ${year}` :
                `Year ${year}`,
            tithes: tithes.map(tithe => {
                var _a;
                return ({
                    date: tithe.date.toLocaleDateString(),
                    amount: tithe.amount,
                    receiptNumber: tithe.receiptNumber,
                    paidBy: ((_a = tithe.titheDetails) === null || _a === void 0 ? void 0 : _a.personPaying) ?
                        `${tithe.titheDetails.personPaying.firstName} ${tithe.titheDetails.personPaying.lastName} (${tithe.titheDetails.personPaying.memberId})` :
                        'Self'
                });
            }),
            totalAmount: tithes.reduce((sum, tithe) => sum + tithe.amount, 0),
            generatedDate: new Date().toLocaleDateString(),
            churchDetails: {
                name: 'Church of Pentecost Abu Dhabi',
                address: 'Abu Dhabi, UAE'
            }
        };
        // Create PDF data with proper typing
        const pdfData = {
            donation: {
                amount: statement.totalAmount,
                type: 'Tithe',
                donor: {
                    _id: titheOwnerId,
                    firstName: donorDetails.firstName,
                    lastName: donorDetails.lastName,
                    memberId: donorDetails.memberId
                },
                date: new Date(),
                receiptNumber: ((_a = tithes[0]) === null || _a === void 0 ? void 0 : _a.receiptNumber) || '',
                paymentMethod: ((_b = tithes[0]) === null || _b === void 0 ? void 0 : _b.paymentMethod) || 'N/A',
                titheDetails: {
                    titheOwner: titheOwnerId,
                    personPaying: (_d = (_c = tithes[0]) === null || _c === void 0 ? void 0 : _c.titheDetails) === null || _d === void 0 ? void 0 : _d.personPaying
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
        const pdfBuffer = yield (0, pdfGenerator_1.generatePDF)('titheStatement', pdfData);
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
    }
    catch (error) {
        next(error);
    }
});
exports.getTitheStatement = getTitheStatement;
const getTitheAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const totalTithes = yield Tithe_1.Tithe.countDocuments();
        const totalAmount = yield Tithe_1.Tithe.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const averageTithe = ((_a = totalAmount[0]) === null || _a === void 0 ? void 0 : _a.total) / totalTithes || 0;
        res.status(200).json({
            status: 'success',
            data: {
                totalTithes,
                totalAmount: ((_b = totalAmount[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                averageTithe
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTitheAnalytics = getTitheAnalytics;
