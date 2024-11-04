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
exports.generatePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePDF = (template, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default();
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        switch (template) {
            case 'donation-receipt':
            case 'titheStatement':
                generateDonationReceipt(doc, data);
                break;
            default:
                throw new Error('Invalid template');
        }
        doc.end();
    });
});
exports.generatePDF = generatePDF;
const generateDonationReceipt = (doc, data) => {
    const { donation, date, churchDetails } = data;
    // Header
    doc.fontSize(20).text(churchDetails.name, { align: 'center' });
    doc.fontSize(12).text(churchDetails.address, { align: 'center' });
    doc.text(`Tel: ${churchDetails.phone} | Email: ${churchDetails.email}`, {
        align: 'center'
    });
    doc.moveDown();
    doc.fontSize(16).text('TITHE STATEMENT', { align: 'center' });
    // Receipt details
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Receipt No: ${donation.receiptNumber}`);
    doc.text(`Date: ${date}`);
    doc.text(`Donor: ${donation.donor.firstName} ${donation.donor.lastName}`);
    if (donation.donor.memberId) {
        doc.text(`Member ID: ${donation.donor.memberId}`);
    }
    doc.text(`Amount: AED ${donation.amount.toFixed(2)}`);
    doc.text(`Type: ${donation.type}`);
    // Optional fundraising details
    if (donation.fundraisingDetails) {
        doc.text(`Fundraising Campaign: ${donation.fundraisingDetails.campaign}`);
        if (donation.fundraisingDetails.projectName) {
            doc.text(`Project: ${donation.fundraisingDetails.projectName}`);
        }
    }
    // Optional tithe details
    if (donation.titheDetails) {
        doc.text(`Tithe Owner ID: ${donation.titheDetails.titheOwner}`);
        if (donation.titheDetails.personPaying) {
            doc.text(`Paid By ID: ${donation.titheDetails.personPaying}`);
        }
    }
    doc.text(`Payment Method: ${donation.paymentMethod}`);
    // Footer
    doc.moveDown();
    doc.fontSize(10);
    doc.text('Thank you for your generous donation!', { align: 'center' });
    doc.fontSize(8);
    doc.text('This receipt is computer generated and requires no signature.', {
        align: 'center'
    });
};
