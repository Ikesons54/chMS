import ExcelJS from 'exceljs';
import { Donation } from '../models/Donation';
import { Types } from 'mongoose';

interface ReportParameters {
  startDate: Date;
  endDate: Date;
  reportType: string;
  [key: string]: any;
}

interface DonorPopulated {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface DonationPopulated {
  date: Date;
  donor: DonorPopulated;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
}

export async function generateTitheReport(parameters: ReportParameters): Promise<Buffer> {
  const { startDate, endDate } = parameters;

  // Fetch data with proper type casting
  const donations = await Donation.find({
    type: 'tithe',
    date: { $gte: startDate, $lte: endDate }
  }).populate<{ donor: DonorPopulated }>('donor', 'firstName lastName');

  // Create workbook
  const workbook = new ExcelJS.Workbook();
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
  donations.forEach((donation: DonationPopulated) => {
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
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
} 