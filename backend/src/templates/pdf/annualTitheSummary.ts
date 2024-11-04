export const annualTitheSummaryTemplate = (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { text-align: center; margin-bottom: 30px; }
    .summary-section { margin-bottom: 40px; }
    .chart-container { margin: 20px 0; height: 300px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .highlight { background-color: #f5f5f5; }
    .statistics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .statistic-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="header">
    <h1>Annual Tithe Summary Report ${data.year}</h1>
    <h2>Church of Pentecost Abu Dhabi</h2>
  </div>

  <div class="summary-section">
    <h3>Annual Statistics</h3>
    <div class="statistics">
      <div class="statistic-card">
        <h4>Total Tithe Collection</h4>
        <p>AED ${data.statistics.totalAmount.toFixed(2)}</p>
      </div>
      <div class="statistic-card">
        <h4>Total Transactions</h4>
        <p>${data.statistics.totalTransactions}</p>
      </div>
      <div class="statistic-card">
        <h4>Average Tithe Amount</h4>
        <p>AED ${data.statistics.averageTitheAmount.toFixed(2)}</p>
      </div>
      <div class="statistic-card">
        <h4>Highest Collection Month</h4>
        <p>${data.statistics.highestMonth.month}: AED ${data.statistics.highestMonth.amount.toFixed(2)}</p>
      </div>
    </div>
  </div>

  <div class="summary-section">
    <h3>Monthly Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th>Total Amount</th>
          <th>Transactions</th>
          <th>Unique Tithers</th>
          <th>Average Tithe</th>
        </tr>
      </thead>
      <tbody>
        ${data.monthlyData.map((month: any) => `
          <tr>
            <td>${month.month}</td>
            <td>AED ${month.amount.toFixed(2)}</td>
            <td>${month.count}</td>
            <td>${month.uniqueTithers}</td>
            <td>AED ${(month.amount / month.count || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="chart-container">
    <canvas id="monthlyChart"></canvas>
  </div>

  <script>
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: ${JSON.stringify(data.chartData)},
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>
`; 