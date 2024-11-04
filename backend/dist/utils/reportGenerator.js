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
exports.generateTitheReport = generateTitheReport;
const exceljs_1 = __importDefault(require("exceljs"));
const Donation_1 = require("../models/Donation");
function generateTitheReport(parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { startDate, endDate } = parameters;
        // Fetch data with proper type casting
        const donations = yield Donation_1.Donation.find({
            type: 'tithe',
            date: { $gte: startDate, $lte: endDate }
        }).populate('donor', 'firstName lastName');
        // Create workbook
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Tithe Report');
        // Add headers
        worksheet.addRow([
            'Date',
            'Donor Name',
            'Amount',
            'Payment Method',
            'Receipt Number'
        ]);
        // Add data with type safety
        donations.forEach((donation) => {
            worksheet.addRow([
                donation.date.toLocaleDateString(),
                `${donation.donor.firstName} ${donation.donor.lastName}`,
                donation.amount,
                donation.paymentMethod,
                donation.receiptNumber
            ]);
        });
        // Format cells
        worksheet.getColumn('C').numFmt = '"$"#,##0.00';
        worksheet.columns.forEach(column => {
            column.width = 15;
        });
        // Generate buffer
        const buffer = yield workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    });
}
