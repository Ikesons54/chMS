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
exports.getTitheReport = exports.getDonorHistory = exports.getDonationsByType = exports.getDonationReceipt = exports.recordDonation = exports.DonationType = void 0;
const Donation_1 = require("../models/Donation");
const errorHandler_1 = require("../middleware/errorHandler");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const date_fns_1 = require("date-fns");
var DonationType;
(function (DonationType) {
    DonationType["TITHE"] = "tithe";
    DonationType["OFFERING"] = "offering";
    DonationType["SPECIAL_OFFERING"] = "special_offering";
    DonationType["BUILDING_FUND"] = "building_fund";
    DonationType["MISSIONS"] = "missions";
    DonationType["OTHER"] = "other";
})(DonationType || (exports.DonationType = DonationType = {}));
const recordDonation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { amount, type, donor, date, paymentMethod, notes, titheDetails } = req.body;
        const donation = yield Donation_1.Donation.create({
            amount,
            type,
            donor,
            date,
            paymentMethod,
            notes,
            titheDetails,
            receiptNumber: `DON-${Date.now()}`,
            recordedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        yield donation.populate('donor', 'firstName lastName email');
        res.status(201).json({
            status: 'success',
            data: { donation }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.recordDonation = recordDonation;
const getDonationReceipt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiptNumber } = req.params;
        const donation = yield Donation_1.Donation.findOne({ receiptNumber })
            .populate('donor', 'firstName lastName email')
            .populate('recordedBy', 'firstName lastName');
        if (!donation) {
            return next(new errorHandler_1.AppError('Donation receipt not found', 404));
        }
        const pdfData = {
            donation: {
                amount: donation.amount,
                type: donation.type,
                donor: {
                    _id: donation.donor._id,
                    firstName: donation.donor.firstName,
                    lastName: donation.donor.lastName
                },
                date: donation.date,
                receiptNumber: donation.receiptNumber,
                paymentMethod: donation.paymentMethod,
                fundraisingDetails: donation.fundraisingDetails,
                titheDetails: donation.titheDetails
            },
            date: (0, date_fns_1.format)(donation.date, 'dd/MM/yyyy'),
            churchDetails: {
                name: process.env.CHURCH_NAME || '',
                address: process.env.CHURCH_ADDRESS || '',
                phone: process.env.CHURCH_PHONE || '',
                email: process.env.CHURCH_EMAIL || ''
            }
        };
        const pdfBuffer = yield (0, pdfGenerator_1.generatePDF)('donation-receipt', pdfData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${receiptNumber}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
});
exports.getDonationReceipt = getDonationReceipt;
const getDonationsByType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, type } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (type)
            query.type = type;
        const donations = yield Donation_1.Donation.find(query)
            .populate('donor', 'firstName lastName')
            .populate('recordedBy', 'firstName lastName')
            .sort({ date: -1 });
        const summary = {
            total: donations.reduce((sum, d) => sum + d.amount, 0),
            count: donations.length,
            byPaymentMethod: donations.reduce((acc, d) => {
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
    }
    catch (error) {
        next(error);
    }
});
exports.getDonationsByType = getDonationsByType;
const getDonorHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { donorId } = req.params;
        const { year } = req.query;
        const query = { donor: donorId };
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            query.date = { $gte: startDate, $lte: endDate };
        }
        const donations = yield Donation_1.Donation.find(query)
            .sort({ date: -1 });
        const summary = {
            totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
            byType: donations.reduce((acc, d) => {
                acc[d.type] = (acc[d.type] || 0) + d.amount;
                return acc;
            }, {}),
            yearlyTotals: donations.reduce((acc, d) => {
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
    }
    catch (error) {
        next(error);
    }
});
exports.getDonorHistory = getDonorHistory;
const getTitheReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const tithes = yield Donation_1.Donation.find({
            type: DonationType.TITHE,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('donor', 'firstName lastName');
        const summary = {
            totalTithes: tithes.reduce((sum, t) => sum + t.amount, 0),
            titheCount: tithes.length,
            uniqueTithers: new Set(tithes.map(t => { var _a; return (_a = t.donor) === null || _a === void 0 ? void 0 : _a._id.toString(); })).size,
            monthlyTotals: tithes.reduce((acc, t) => {
                const monthYear = (0, date_fns_1.format)(t.date, 'MMM yyyy');
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
    }
    catch (error) {
        next(error);
    }
});
exports.getTitheReport = getTitheReport;
