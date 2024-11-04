import PDFKit from 'pdfkit';
import { Types } from 'mongoose';

export interface PDFDonor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  memberId?: string;
}

interface ChurchDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface FundraisingDetails {
  campaign: string;
  projectName?: string;
}

interface PDFDonation {
  amount: number;
  type: string;
  donor: PDFDonor;
  date: Date;
  receiptNumber: string;
  paymentMethod: string;
  fundraisingDetails?: FundraisingDetails;
  titheDetails?: {
    titheOwner: Types.ObjectId;
    personPaying?: Types.ObjectId;
  };
}

export interface PDFTemplateData {
  donation: PDFDonation;
  date: string;
  churchDetails: ChurchDetails;
}

export const generatePDF = async (
  template: string,
  data: PDFTemplateData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFKit();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
};

const generateDonationReceipt = (doc: PDFKit.PDFDocument, data: PDFTemplateData) => {
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
