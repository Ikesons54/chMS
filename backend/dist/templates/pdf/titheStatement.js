"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.titheStatementTemplate = void 0;
const titheStatementTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { text-align: center; margin-bottom: 30px; }
    .statement-info { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 30px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.churchDetails.name}</h1>
    <p>${data.churchDetails.address}</p>
    <h2>Tithe Statement</h2>
  </div>

  <div class="statement-info">
    <p><strong>Name:</strong> ${data.titheOwner}</p>
    <p><strong>Period:</strong> ${data.period}</p>
    <p><strong>Generated Date:</strong> ${data.generatedDate}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Receipt No.</th>
        <th>Paid By</th>
        <th>Amount (AED)</th>
        <th>Member ID</th>
      </tr>
    </thead>
    <tbody>
      ${data.tithes.map((tithe) => `
        <tr>
          <td>${tithe.date}</td>
          <td>${tithe.receiptNumber}</td>
          <td>${tithe.paidBy}</td>
          <td>${tithe.amount.toFixed(2)}</td>
          <td>${tithe.memberId}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total">
    <p>Total Amount: AED ${data.totalAmount.toFixed(2)}</p>
  </div>

  <div class="footer">
    <p>Thank you for your faithful giving.</p>
    <p><em>Malachi 3:10 - "Bring the whole tithe into the storehouse..."</em></p>
  </div>
</body>
</html>
`;
exports.titheStatementTemplate = titheStatementTemplate;
