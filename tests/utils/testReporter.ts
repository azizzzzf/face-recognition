/**
 * Test Reporter Utility
 * Generates comprehensive HTML reports for all test types
 */

import fs from 'fs';
import path from 'path';

export interface TestResult {
  id: string;
  testCase: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: 'Berhasil' | 'Tidak Berhasil' | 'Pending';
  executionTime: number;
  screenshot?: string;
  errorMessage?: string;
  category: string;
  timestamp: Date;
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  pending: number;
  passRate: number;
  totalExecutionTime: number;
  categories: { [key: string]: number };
}

export class TestReporter {
  private results: TestResult[] = [];
  private reportsDir: string;

  constructor(reportsDir: string = 'tests/reports') {
    this.reportsDir = reportsDir;
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
    
    // Create subdirectories
    ['screenshots', 'html', 'json', 'csv'].forEach(subDir => {
      const dirPath = path.join(this.reportsDir, subDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  addResults(results: TestResult[]): void {
    this.results.push(...results);
  }

  getSummary(): TestSummary {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'Berhasil').length;
    const failed = this.results.filter(r => r.status === 'Tidak Berhasil').length;
    const pending = this.results.filter(r => r.status === 'Pending').length;
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;
    const totalExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0);
    
    const categories: { [key: string]: number } = {};
    this.results.forEach(result => {
      categories[result.category] = (categories[result.category] || 0) + 1;
    });

    return {
      totalTests,
      passed,
      failed,
      pending,
      passRate,
      totalExecutionTime,
      categories
    };
  }

  generateHTMLReport(filename: string = 'test-report.html'): string {
    const summary = this.getSummary();
    const timestamp = new Date().toLocaleString('id-ID');
    
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Recognition App - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .pending { color: #ffc107; }
        .total { color: #007bff; }
        .pass-rate { color: #17a2b8; }
        
        .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #343a40; color: white; padding: 15px; text-align: left; }
        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e8f4f8; }
        
        .status-badge { padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 0.85em; }
        .status-berhasil { background-color: #28a745; }
        .status-gagal { background-color: #dc3545; }
        .status-pending { background-color: #ffc107; color: #212529; }
        
        .screenshot-link { color: #007bff; text-decoration: none; }
        .screenshot-link:hover { text-decoration: underline; }
        
        .category-filter { margin-bottom: 20px; }
        .category-filter button { margin-right: 10px; padding: 8px 16px; border: 2px solid #007bff; background: white; color: #007bff; border-radius: 20px; cursor: pointer; }
        .category-filter button.active, .category-filter button:hover { background: #007bff; color: white; }
        
        .progress-bar { width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745 0%, #20c997 100%); transition: width 0.3s ease; }
        
        .execution-time { color: #6c757d; font-size: 0.9em; }
        .error-message { color: #dc3545; font-style: italic; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .error-message:hover { white-space: normal; overflow: visible; }
        
        @media (max-width: 768px) {
            body { margin: 10px; }
            .summary { grid-template-columns: repeat(2, 1fr); }
            table { font-size: 0.9em; }
            th, td { padding: 10px 8px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Face Recognition App - Test Report</h1>
        <p>Generated on: ${timestamp}</p>
        <p>Comprehensive testing results for all test suites</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="number total">${summary.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="number passed">${summary.passed}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="number failed">${summary.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Pending</h3>
            <div class="number pending">${summary.pending}</div>
        </div>
        <div class="summary-card">
            <h3>Pass Rate</h3>
            <div class="number pass-rate">${summary.passRate.toFixed(1)}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${summary.passRate}%"></div>
            </div>
        </div>
        <div class="summary-card">
            <h3>Execution Time</h3>
            <div class="number">${(summary.totalExecutionTime / 1000).toFixed(2)}s</div>
        </div>
    </div>

    <div class="category-filter">
        <button onclick="filterByCategory('all')" class="active">All Categories</button>
        ${Object.keys(summary.categories).map(category => 
          `<button onclick="filterByCategory('${category}')">${category} (${summary.categories[category]})</button>`
        ).join('')}
    </div>

    <div class="table-container">
        <table id="resultsTable">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Test Case</th>
                    <th>Description</th>
                    <th>Expected Result</th>
                    <th>Actual Result</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Time</th>
                    <th>Screenshot</th>
                </tr>
            </thead>
            <tbody>
                ${this.results.map((result, index) => `
                    <tr data-category="${result.category}">
                        <td>${index + 1}</td>
                        <td><strong>${result.testCase}</strong></td>
                        <td>${result.description}</td>
                        <td>${result.expectedResult}</td>
                        <td>
                            ${result.actualResult}
                            ${result.errorMessage ? `<div class="error-message" title="${result.errorMessage}">Error: ${result.errorMessage}</div>` : ''}
                        </td>
                        <td>
                            <span class="status-badge status-${result.status.toLowerCase().replace(' ', '-')}">
                                ${result.status}
                            </span>
                        </td>
                        <td>${result.category}</td>
                        <td class="execution-time">${result.executionTime}ms</td>
                        <td>
                            ${result.screenshot ? 
                              `<a href="${result.screenshot}" class="screenshot-link" target="_blank">View Screenshot</a>` : 
                              '-'
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <script>
        function filterByCategory(category) {
            const rows = document.querySelectorAll('#resultsTable tbody tr');
            const buttons = document.querySelectorAll('.category-filter button');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            rows.forEach(row => {
                if (category === 'all' || row.dataset.category === category) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;

    const filePath = path.join(this.reportsDir, 'html', filename);
    fs.writeFileSync(filePath, html, 'utf-8');
    return filePath;
  }

  generateJSONReport(filename: string = 'test-results.json'): string {
    const report = {
      summary: this.getSummary(),
      results: this.results,
      generatedAt: new Date().toISOString()
    };

    const filePath = path.join(this.reportsDir, 'json', filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
    return filePath;
  }

  generateCSVReport(filename: string = 'test-results.csv'): string {
    const headers = ['No', 'Test Case', 'Description', 'Expected Result', 'Actual Result', 'Status', 'Category', 'Execution Time (ms)', 'Screenshot'];
    const csvRows = [headers.join(',')];

    this.results.forEach((result, index) => {
      const row = [
        index + 1,
        `"${result.testCase.replace(/"/g, '""')}"`,
        `"${result.description.replace(/"/g, '""')}"`,
        `"${result.expectedResult.replace(/"/g, '""')}"`,
        `"${result.actualResult.replace(/"/g, '""')}"`,
        result.status,
        result.category,
        result.executionTime,
        result.screenshot || ''
      ];
      csvRows.push(row.join(','));
    });

    const filePath = path.join(this.reportsDir, 'csv', filename);
    fs.writeFileSync(filePath, csvRows.join('\n'), 'utf-8');
    return filePath;
  }

  generateAllReports(baseFilename: string = 'test-results'): {
    html: string;
    json: string;
    csv: string;
  } {
    return {
      html: this.generateHTMLReport(`${baseFilename}.html`),
      json: this.generateJSONReport(`${baseFilename}.json`),
      csv: this.generateCSVReport(`${baseFilename}.csv`)
    };
  }

  clearResults(): void {
    this.results = [];
  }
}

export default TestReporter;