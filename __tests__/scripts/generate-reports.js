#!/usr/bin/env node
/**
 * Generate Comprehensive Test Reports
 * Consolidates all test results into unified reports
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Generating comprehensive test reports...');

const reportsDir = path.join(process.cwd(), 'tests/reports');
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');

// Collect all test results
const collectTestResults = () => {
  const results = {
    summary: {
      generatedAt: now.toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      pending: 0,
      skipped: 0,
      executionTime: 0
    },
    categories: {},
    detailed: []
  };

  // Look for Jest results
  const jestReportPath = path.join(reportsDir, 'html/jest-report.html');
  if (fs.existsSync(jestReportPath)) {
    console.log('✅ Found Jest report');
    // Parse Jest HTML report or JSON if available
  }

  // Look for Playwright results  
  const playwrightJsonPath = path.join(reportsDir, 'json/playwright-results.json');
  if (fs.existsSync(playwrightJsonPath)) {
    console.log('✅ Found Playwright results');
    try {
      const playwrightData = JSON.parse(fs.readFileSync(playwrightJsonPath, 'utf-8'));
      results.categories.e2e = {
        total: playwrightData.stats?.expected || 0,
        passed: playwrightData.stats?.passed || 0,
        failed: playwrightData.stats?.failed || 0,
        duration: playwrightData.stats?.duration || 0
      };
    } catch (error) {
      console.warn('⚠️ Could not parse Playwright results:', error.message);
    }
  }

  // Look for individual test category results
  const categoryDirs = ['smoke', 'unit', 'integration', 'blackbox', 'security', 'performance'];
  categoryDirs.forEach(category => {
    const categoryReportPath = path.join(reportsDir, 'json', `${category}-results.json`);
    if (fs.existsSync(categoryReportPath)) {
      try {
        const categoryData = JSON.parse(fs.readFileSync(categoryReportPath, 'utf-8'));
        results.categories[category] = categoryData.summary;
        if (categoryData.results) {
          results.detailed.push(...categoryData.results);
        }
        console.log(`✅ Found ${category} test results`);
      } catch (error) {
        console.warn(`⚠️ Could not parse ${category} results:`, error.message);
      }
    }
  });

  // Calculate totals
  Object.values(results.categories).forEach(category => {
    if (typeof category === 'object' && category.totalTests) {
      results.summary.totalTests += category.totalTests || category.total || 0;
      results.summary.passed += category.passed || 0;
      results.summary.failed += category.failed || 0;
      results.summary.pending += category.pending || 0;
      results.summary.executionTime += category.totalExecutionTime || category.duration || 0;
    }
  });

  results.summary.passRate = results.summary.totalTests > 0 
    ? (results.summary.passed / results.summary.totalTests * 100).toFixed(2)
    : 0;

  return results;
};

// Generate consolidated HTML report
const generateConsolidatedHTMLReport = (results) => {
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Recognition App - Comprehensive Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container { max-width: 1200px; margin: 0 auto; }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .header .subtitle {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 20px;
        }
        
        .header .timestamp {
            background: #edf2f7;
            color: #4a5568;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .summary-card h3 {
            color: #4a5568;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .summary-card .number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .total { color: #3182ce; }
        .passed { color: #38a169; }
        .failed { color: #e53e3e; }
        .pending { color: #d69e2e; }
        .pass-rate { color: #805ad5; }
        
        .progress-ring {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            position: relative;
        }
        
        .progress-ring svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }
        
        .progress-ring circle {
            fill: none;
            stroke-width: 8;
        }
        
        .progress-ring .background {
            stroke: #e2e8f0;
        }
        
        .progress-ring .progress {
            stroke: #38a169;
            stroke-linecap: round;
            stroke-dasharray: 251;
            stroke-dashoffset: ${251 - (results.summary.passRate / 100 * 251)};
            transition: stroke-dashoffset 0.5s ease;
        }
        
        .categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .category-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .category-card h3 {
            color: #2d3748;
            font-size: 1.3rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .category-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .smoke { background: #fed7d7; color: #c53030; }
        .unit { background: #c6f6d5; color: #2f855a; }
        .integration { background: #bee3f8; color: #2b6cb0; }
        .e2e { background: #d6f5d6; color: #276749; }
        .blackbox { background: #ffd6cc; color: #c05621; }
        .security { background: #fbb6ce; color: #b83280; }
        .performance { background: #e9d8fd; color: #6b46c1; }
        
        .category-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat .label {
            font-size: 0.8rem;
            color: #718096;
            margin-bottom: 5px;
        }
        
        .stat .value {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .detailed-results {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .detailed-results h2 {
            color: #2d3748;
            font-size: 1.8rem;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .results-table th {
            background: #edf2f7;
            color: #4a5568;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .results-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        .results-table tr:hover {
            background: #f7fafc;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            color: white;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        
        .status-passed { background: #38a169; }
        .status-failed { background: #e53e3e; }
        .status-pending { background: #d69e2e; }
        
        .execution-time {
            color: #718096;
            font-size: 0.9rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: white;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .container { padding: 0 10px; }
            .header { padding: 20px; }
            .header h1 { font-size: 2rem; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .categories { grid-template-columns: 1fr; }
            .results-table { font-size: 0.9rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Face Recognition App</h1>
            <div class="subtitle">Comprehensive Test Report</div>
            <div class="timestamp">Generated: ${now.toLocaleString('id-ID')}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number total">${results.summary.totalTests}</div>
                <div>All test categories</div>
            </div>
            
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${results.summary.passed}</div>
                <div>Successful tests</div>
            </div>
            
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${results.summary.failed}</div>
                <div>Failed tests</div>
            </div>
            
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="progress-ring">
                    <svg>
                        <circle class="background" cx="40" cy="40" r="36"></circle>
                        <circle class="progress" cx="40" cy="40" r="36"></circle>
                    </svg>
                </div>
                <div class="number pass-rate">${results.summary.passRate}%</div>
            </div>
            
            <div class="summary-card">
                <h3>Execution Time</h3>
                <div class="number">${Math.round(results.summary.executionTime / 1000)}s</div>
                <div>Total duration</div>
            </div>
        </div>

        <div class="categories">
            ${Object.entries(results.categories).map(([category, stats]) => `
            <div class="category-card">
                <h3>
                    <div class="category-icon ${category}">
                        ${getCategoryIcon(category)}
                    </div>
                    ${getCategoryName(category)}
                </h3>
                <div class="category-stats">
                    <div class="stat">
                        <div class="label">Total</div>
                        <div class="value total">${stats.totalTests || stats.total || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="label">Passed</div>
                        <div class="value passed">${stats.passed || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="label">Failed</div>
                        <div class="value failed">${stats.failed || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="label">Time</div>
                        <div class="value">${Math.round((stats.totalExecutionTime || stats.duration || 0) / 1000)}s</div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>

        ${results.detailed.length > 0 ? `
        <div class="detailed-results">
            <h2>📋 Detailed Test Results</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Test Case</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.detailed.slice(0, 100).map(test => `
                    <tr>
                        <td><strong>${test.testCase || test.title || 'Unknown'}</strong></td>
                        <td>${test.category || 'General'}</td>
                        <td>
                            <span class="status-badge status-${(test.status || 'unknown').toLowerCase().replace(' ', '-')}">
                                ${test.status || 'Unknown'}
                            </span>
                        </td>
                        <td class="execution-time">${test.executionTime || 0}ms</td>
                        <td>${test.description || test.actualResult || ''}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ${results.detailed.length > 100 ? `<p style="margin-top: 20px; color: #718096;">Showing first 100 results. Total: ${results.detailed.length}</p>` : ''}
        </div>
        ` : ''}

        <div class="footer">
            <p>🚀 Face Recognition App Testing Suite</p>
            <p>Powered by Jest, Playwright, and Custom Test Runners</p>
        </div>
    </div>
</body>
</html>`;

  const filePath = path.join(reportsDir, 'html', `comprehensive-report-${timestamp}.html`);
  fs.writeFileSync(filePath, html);
  
  // Also create a latest report
  const latestPath = path.join(reportsDir, 'html', 'comprehensive-report-latest.html');
  fs.writeFileSync(latestPath, html);
  
  return { filePath, latestPath };
};

// Helper functions for HTML report
function getCategoryIcon(category) {
  const icons = {
    smoke: '💨',
    unit: '🧩',
    integration: '🔗',
    e2e: '🎭',
    blackbox: '📦',
    security: '🛡️',
    performance: '⚡'
  };
  return icons[category] || '🔍';
}

function getCategoryName(category) {
  const names = {
    smoke: 'Smoke Tests',
    unit: 'Unit Tests', 
    integration: 'Integration Tests',
    e2e: 'End-to-End Tests',
    blackbox: 'Blackbox Tests',
    security: 'Security Tests',
    performance: 'Performance Tests'
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// Generate JSON summary for CI/CD
const generateJSONSummary = (results) => {
  const summary = {
    ...results.summary,
    categories: results.categories,
    timestamp: now.toISOString(),
    buildInfo: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  const filePath = path.join(reportsDir, 'json', `test-summary-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  
  const latestPath = path.join(reportsDir, 'json', 'test-summary-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2));
  
  return { filePath, latestPath };
};

// Main execution
try {
  const results = collectTestResults();
  
  const htmlReport = generateConsolidatedHTMLReport(results);
  const jsonSummary = generateJSONSummary(results);
  
  console.log('✅ Reports generated successfully:');
  console.log(`   📊 HTML Report: ${htmlReport.latestPath}`);
  console.log(`   📋 JSON Summary: ${jsonSummary.latestPath}`);
  
  // Output summary to console
  console.log('\n📈 Test Summary:');
  console.log(`   Total Tests: ${results.summary.totalTests}`);
  console.log(`   Passed: ${results.summary.passed} (${results.summary.passRate}%)`);
  console.log(`   Failed: ${results.summary.failed}`);
  console.log(`   Execution Time: ${Math.round(results.summary.executionTime / 1000)}s`);
  
  console.log('\n🔍 Category Breakdown:');
  Object.entries(results.categories).forEach(([category, stats]) => {
    const passed = stats.passed || 0;
    const total = stats.totalTests || stats.total || 0;
    const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    console.log(`   ${getCategoryIcon(category)} ${getCategoryName(category)}: ${passed}/${total} (${rate}%)`);
  });
  
  console.log('\n🎉 Comprehensive test reporting completed!');
  
} catch (error) {
  console.error('❌ Error generating reports:', error.message);
  process.exit(1);
}