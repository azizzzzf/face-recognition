#!/usr/bin/env node
/**
 * Blackbox Test Runner Script
 * Menjalankan function-based blackbox tests dengan reporting yang comprehensive
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 BLACKBOX FUNCTION TESTING - FACE RECOGNITION APP');
console.log('====================================================');
console.log('Testing aplikasi dari perspektif user (Input → Output)');
console.log('');

const testCategories = [
  {
    name: 'Login Functions',
    script: 'npm run test:blackbox:login',
    description: 'Testing login page functionality',
    emoji: '🔐'
  },
  {
    name: 'Registration Functions', 
    script: 'npm run test:blackbox:register',
    description: 'Testing registration page functionality',
    emoji: '📝'
  },
  {
    name: 'Face Registration Functions',
    script: 'npm run test:blackbox:face-registration', 
    description: 'Testing face registration functionality',
    emoji: '📷'
  },
  {
    name: 'Face Recognition Functions',
    script: 'npm run test:blackbox:face-recognition',
    description: 'Testing face recognition functionality', 
    emoji: '🎯'
  }
];

const results = [];
const startTime = Date.now();

async function runTest(category) {
  console.log(`${category.emoji} Running ${category.name}...`);
  console.log(`   Description: ${category.description}`);
  
  const testStartTime = Date.now();
  
  try {
    const output = execSync(category.script, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60000 // 1 minute timeout per category
    });
    
    const testEndTime = Date.now();
    const duration = testEndTime - testStartTime;
    
    // Parse output untuk mendapatkan pass/fail count
    const passCount = (output.match(/✅/g) || []).length;
    const failCount = (output.match(/❌/g) || []).length;
    const totalCount = passCount + failCount;
    
    const result = {
      category: category.name,
      emoji: category.emoji,
      passed: passCount,
      failed: failCount,
      total: totalCount,
      duration: Math.round(duration / 1000),
      status: failCount === 0 ? 'SUCCESS' : 'PARTIAL',
      output: output
    };
    
    results.push(result);
    
    console.log(`   ✅ ${category.name}: ${passCount}/${totalCount} passed (${duration}ms)`);
    
    if (failCount > 0) {
      console.log(`   ⚠️  ${failCount} tests failed - check detailed output`);
    }
    
    return result;
    
  } catch (error) {
    const testEndTime = Date.now();
    const duration = testEndTime - testStartTime;
    
    const result = {
      category: category.name,
      emoji: category.emoji,
      passed: 0,
      failed: 0,
      total: 0,
      duration: Math.round(duration / 1000),
      status: 'ERROR',
      error: error.message,
      output: error.stdout || error.stderr || error.message
    };
    
    results.push(result);
    
    console.log(`   ❌ ${category.name}: ERROR - ${error.message}`);
    
    return result;
  }
}

async function main() {
  console.log('🚀 Starting Function-Based Blackbox Testing...');
  console.log('');
  
  // Run all test categories
  for (const category of testCategories) {
    await runTest(category);
    console.log(''); // Add spacing
  }
  
  const endTime = Date.now();
  const totalDuration = Math.round((endTime - startTime) / 1000);
  
  // Calculate summary
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  
  // Print summary
  console.log('📊 BLACKBOX FUNCTION TESTING SUMMARY');
  console.log('====================================');
  console.log('');
  
  // Category breakdown
  console.log('📋 Category Results:');
  results.forEach(result => {
    const statusEmoji = result.status === 'SUCCESS' ? '✅' : 
                       result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`   ${statusEmoji} ${result.emoji} ${result.category}: ${result.passed}/${result.total} (${result.duration}s)`);
  });
  console.log('');
  
  // Overall statistics
  console.log('🎯 Overall Statistics:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${totalPassed} ✅`);
  console.log(`   Failed: ${totalFailed} ❌`);
  console.log(`   Pass Rate: ${passRate}%`);
  console.log(`   Total Duration: ${totalDuration}s`);
  console.log('');
  
  // Function breakdown table
  console.log('📋 Function Testing Breakdown:');
  console.log('┌─────────────────────────────────┬─────────┬─────────┬─────────┬──────────┐');
  console.log('│ Function Category               │ Passed  │ Failed  │ Total   │ Duration │');
  console.log('├─────────────────────────────────┼─────────┼─────────┼─────────┼──────────┤');
  
  results.forEach(result => {
    const name = result.category.padEnd(31);
    const passed = result.passed.toString().padStart(7);
    const failed = result.failed.toString().padStart(7);
    const total = result.total.toString().padStart(7);
    const duration = `${result.duration}s`.padStart(8);
    
    console.log(`│ ${name} │ ${passed} │ ${failed} │ ${total} │ ${duration} │`);
  });
  
  console.log('└─────────────────────────────────┴─────────┴─────────┴─────────┴──────────┘');
  console.log('');
  
  // Save detailed results
  const reportData = {
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      passRate: parseFloat(passRate),
      totalDuration,
      timestamp: new Date().toISOString()
    },
    categories: results,
    testType: 'Function-Based Blackbox Testing',
    description: 'Testing aplikasi dari perspektif user dengan fokus Input → Output'
  };
  
  const reportsDir = path.join(process.cwd(), 'tests/reports/json');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, `blackbox-functions-${Date.now()}.json`);
  const latestReportPath = path.join(reportsDir, 'blackbox-functions-latest.json');
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  fs.writeFileSync(latestReportPath, JSON.stringify(reportData, null, 2));
  
  console.log('💾 Test Results Saved:');
  console.log(`   Detailed: ${reportPath}`);
  console.log(`   Latest: ${latestReportPath}`);
  console.log('');
  
  // Generate HTML report
  generateHTMLReport(reportData);
  
  // Exit with appropriate code
  if (totalFailed === 0 && totalTests > 0) {
    console.log('🎉 All blackbox function tests passed!');
    process.exit(0);
  } else if (totalFailed > 0) {
    console.log('⚠️  Some blackbox function tests failed - check reports for details');
    process.exit(1);
  } else {
    console.log('❌ No tests were executed');
    process.exit(1);
  }
}

function generateHTMLReport(reportData) {
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Function-Based Blackbox Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; font-size: 0.9rem; }
        .summary-card .number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .total { color: #2196F3; }
        .rate { color: #FF9800; }
        
        .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .category-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .category-card h3 { color: #333; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; }
        .stat { padding: 10px; border-radius: 5px; }
        .stat.passed { background: #E8F5E8; color: #2E7D32; }
        .stat.failed { background: #FFEBEE; color: #C62828; }
        .stat.total { background: #E3F2FD; color: #1565C0; }
        .stat-number { font-size: 1.5em; font-weight: bold; }
        .stat-label { font-size: 0.8em; margin-top: 5px; }
        
        .definition { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #4CAF50; }
        .definition h3 { margin-top: 0; color: #2E7D32; }
        
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        th { background: #333; color: white; padding: 15px; text-align: left; }
        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
        
        .status-success { color: #4CAF50; font-weight: bold; }
        .status-partial { color: #FF9800; font-weight: bold; }
        .status-error { color: #f44336; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Function-Based Blackbox Test Report</h1>
        <p>Testing aplikasi dari perspektif user (Input → Output)</p>
        <p>Generated: ${new Date(reportData.summary.timestamp).toLocaleString('id-ID')}</p>
    </div>

    <div class="definition">
        <h3>📚 Pengertian Blackbox Testing</h3>
        <p><strong>Blackbox Testing</strong> adalah metode pengujian perangkat lunak yang berfokus pada <strong>fungsionalitas sistem dari sudut pandang pengguna</strong> tanpa mengetahui struktur internal atau kode sumbernya.</p>
        <p><strong>Tujuan:</strong> Memvalidasi apakah perangkat lunak menghasilkan <strong>output yang sesuai dengan input yang diberikan</strong>.</p>
        <p><strong>Focus:</strong> Input → Process → Output untuk setiap function pada halaman aplikasi.</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="number total">${reportData.summary.totalTests}</div>
            <div>Function tests</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="number passed">${reportData.summary.totalPassed}</div>
            <div>Successful functions</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="number failed">${reportData.summary.totalFailed}</div>
            <div>Failed functions</div>
        </div>
        <div class="summary-card">
            <h3>Pass Rate</h3>
            <div class="number rate">${reportData.summary.passRate}%</div>
            <div>Success rate</div>
        </div>
        <div class="summary-card">
            <h3>Duration</h3>
            <div class="number">${reportData.summary.totalDuration}s</div>
            <div>Total execution time</div>
        </div>
    </div>

    <h2>📋 Function Categories Results</h2>
    <div class="categories">
        ${reportData.categories.map(category => `
        <div class="category-card">
            <h3>${category.emoji} ${category.category}</h3>
            <div class="stats">
                <div class="stat passed">
                    <div class="stat-number">${category.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat failed">
                    <div class="stat-number">${category.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat total">
                    <div class="stat-number">${category.total}</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>
            <p style="margin-top: 10px; color: #666; text-align: center;">
                Duration: ${category.duration}s | Status: 
                <span class="status-${category.status.toLowerCase()}">${category.status}</span>
            </p>
        </div>
        `).join('')}
    </div>

    <h2>📊 Detailed Results Table</h2>
    <table>
        <thead>
            <tr>
                <th>Function Category</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Total</th>
                <th>Duration</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${reportData.categories.map(category => `
            <tr>
                <td>${category.emoji} ${category.category}</td>
                <td style="color: #4CAF50; font-weight: bold;">${category.passed}</td>
                <td style="color: #f44336; font-weight: bold;">${category.failed}</td>
                <td>${category.total}</td>
                <td>${category.duration}s</td>
                <td><span class="status-${category.status.toLowerCase()}">${category.status}</span></td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div style="margin-top: 40px; text-align: center; color: #666;">
        <p>🚀 Face Recognition App - Function-Based Blackbox Testing</p>
        <p>Generated by automated testing suite</p>
    </div>
</body>
</html>`;

  const htmlReportsDir = path.join(process.cwd(), 'tests/reports/html');
  if (!fs.existsSync(htmlReportsDir)) {
    fs.mkdirSync(htmlReportsDir, { recursive: true });
  }
  
  const htmlReportPath = path.join(htmlReportsDir, `blackbox-functions-${Date.now()}.html`);
  const latestHTMLPath = path.join(htmlReportsDir, 'blackbox-functions-latest.html');
  
  fs.writeFileSync(htmlReportPath, html);
  fs.writeFileSync(latestHTMLPath, html);
  
  console.log('📊 HTML Report Generated:');
  console.log(`   Latest: ${latestHTMLPath}`);
}

// Run the main function
main().catch(console.error);