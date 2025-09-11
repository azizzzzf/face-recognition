#!/usr/bin/env node

/**
 * Performance Testing Script for Face Recognition App
 * Tests various performance aspects after optimization
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

class PerformanceTester {
  constructor() {
    this.browser = null
    this.page = null
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {}
    }
  }

  async initialize() {
    console.log('🚀 Initializing performance test suite...')
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    this.page = await this.browser.newPage()
    
    // Enable performance monitoring
    await this.page.setCacheEnabled(false)
    await this.page.setViewport({ width: 1280, height: 720 })
    
    // Intercept network requests for analysis
    await this.page.setRequestInterception(true)
    const networkMetrics = []
    
    this.page.on('request', request => {
      networkMetrics.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      })
      request.continue()
    })
    
    this.page.on('response', response => {
      const request = networkMetrics.find(r => r.url === response.url())
      if (request) {
        request.duration = Date.now() - request.timestamp
        request.status = response.status()
        request.size = response.headers()['content-length'] || 0
      }
    })
    
    this.networkMetrics = networkMetrics
    
    console.log('✅ Performance test suite initialized')
  }

  async testPageLoad(url, pageName) {
    console.log(`📊 Testing ${pageName} page load performance...`)
    
    const startTime = Date.now()
    
    // Navigate and wait for network idle
    const response = await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })
    
    const loadTime = Date.now() - startTime
    
    // Get performance metrics
    const metrics = await this.page.metrics()
    
    // Get Core Web Vitals
    const webVitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for measurements to be available
        setTimeout(() => {
          const vitals = {}
          
          // Get stored web vitals if available
          if (sessionStorage.getItem('webVitals')) {
            Object.assign(vitals, JSON.parse(sessionStorage.getItem('webVitals')))
          }
          
          // Get navigation timing
          const nav = performance.getEntriesByType('navigation')[0]
          if (nav) {
            vitals.TTFB = nav.responseStart - nav.requestStart
            vitals.DOMContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart
            vitals.PageLoad = nav.loadEventEnd - nav.loadEventStart
          }
          
          resolve(vitals)
        }, 2000)
      })
    })
    
    // Get resource loading metrics
    const resourceMetrics = await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources.map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: r.transferSize || 0,
        type: r.initiatorType
      }))
    })
    
    const testResult = {
      page: pageName,
      url,
      loadTime,
      status: response.status(),
      metrics: {
        ...metrics,
        ...webVitals
      },
      resources: resourceMetrics,
      networkRequests: this.networkMetrics.filter(r => r.url.includes(url.split('://')[1].split('/')[0]))
    }
    
    this.results.tests.push(testResult)
    
    console.log(`✅ ${pageName} loaded in ${loadTime}ms`)
    console.log(`   - TTFB: ${webVitals.TTFB?.toFixed(2) || 'N/A'}ms`)
    console.log(`   - DOM Ready: ${webVitals.DOMContentLoaded?.toFixed(2) || 'N/A'}ms`)
    console.log(`   - Resources: ${resourceMetrics.length}`)
    
    return testResult
  }

  async testFaceAPIPerformance() {
    console.log('🧠 Testing Face-API model loading performance...')
    
    await this.page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' })
    
    // Test model loading time
    const modelLoadTime = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now()
        let modelsLoaded = false
        
        // Monitor for model loading completion
        const checkModels = setInterval(() => {
          // Check if models are available (this would need to be adapted based on your implementation)
          if (window.faceapi && window.faceapi.nets && window.faceapi.nets.tinyFaceDetector.isLoaded) {
            modelsLoaded = true
            clearInterval(checkModels)
            resolve(performance.now() - startTime)
          }
        }, 100)
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (!modelsLoaded) {
            clearInterval(checkModels)
            resolve(-1) // Indicate timeout
          }
        }, 30000)
      })
    })
    
    this.results.tests.push({
      test: 'FaceAPI Model Loading',
      duration: modelLoadTime,
      success: modelLoadTime > 0
    })
    
    if (modelLoadTime > 0) {
      console.log(`✅ Face-API models loaded in ${modelLoadTime.toFixed(2)}ms`)
    } else {
      console.warn('⚠️ Face-API model loading timed out')
    }
  }

  async testBundleSize() {
    console.log('📦 Analyzing bundle size...')
    
    const bundleStats = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: []
    }
    
    // This would need to be adapted based on your build output
    const buildPath = path.join(process.cwd(), '.next')
    
    if (fs.existsSync(buildPath)) {
      // Read build statistics if available
      const statsPath = path.join(buildPath, 'build-manifest.json')
      if (fs.existsSync(statsPath)) {
        try {
          const buildManifest = JSON.parse(fs.readFileSync(statsPath, 'utf8'))
          bundleStats.chunks = Object.keys(buildManifest.pages || {})
          console.log(`📊 Found ${bundleStats.chunks.length} page chunks`)
        } catch (error) {
          console.warn('Could not read build manifest:', error.message)
        }
      }
    }
    
    this.results.tests.push({
      test: 'Bundle Analysis',
      stats: bundleStats
    })
  }

  async testMemoryUsage() {
    console.log('💾 Testing memory usage...')
    
    await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' })
    
    // Get initial memory usage
    const initialMemory = await this.page.evaluate(() => {
      if ('memory' in performance) {
        const memory = performance.memory
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    // Navigate through different pages to test memory leaks
    const pages = ['/', '/register', '/recognize', '/attendance']
    const memoryReadings = []
    
    for (const page of pages) {
      await this.page.goto(`http://localhost:3000${page}`, { waitUntil: 'networkidle2' })
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for page to settle
      
      const memory = await this.page.evaluate(() => {
        if ('memory' in performance) {
          const memory = performance.memory
          return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            page: window.location.pathname
          }
        }
        return null
      })
      
      if (memory) {
        memoryReadings.push(memory)
        console.log(`   ${page}: ${(memory.used / 1048576).toFixed(2)}MB used`)
      }
    }
    
    this.results.tests.push({
      test: 'Memory Usage',
      initial: initialMemory,
      readings: memoryReadings
    })
  }

  generateReport() {
    console.log('📊 Generating performance report...')
    
    // Calculate summary statistics
    const loadTests = this.results.tests.filter(t => t.loadTime)
    const avgLoadTime = loadTests.reduce((sum, t) => sum + t.loadTime, 0) / loadTests.length
    
    this.results.summary = {
      totalTests: this.results.tests.length,
      averageLoadTime: avgLoadTime,
      passedTests: this.results.tests.filter(t => t.success !== false).length,
      timestamp: this.results.timestamp
    }
    
    // Save report
    const reportDir = path.join(process.cwd(), 'tests', 'reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const reportPath = path.join(reportDir, 'performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport()
    const htmlPath = path.join(reportDir, 'performance-report.html')
    fs.writeFileSync(htmlPath, htmlReport)
    
    console.log(`✅ Performance report saved to: ${reportPath}`)
    console.log(`🌐 HTML report available at: ${htmlPath}`)
    
    return this.results
  }

  generateHTMLReport() {
    const loadTests = this.results.tests.filter(t => t.loadTime)
    const memoryTest = this.results.tests.find(t => t.test === 'Memory Usage')
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Face Recognition App - Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .good { border-left: 4px solid #10b981; }
        .warning { border-left: 4px solid #f59e0b; }
        .error { border-left: 4px solid #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Face Recognition App - Performance Report</h1>
        <p>Generated: ${this.results.timestamp}</p>
    </div>
    
    <div class="metric ${this.results.summary.averageLoadTime < 3000 ? 'good' : this.results.summary.averageLoadTime < 5000 ? 'warning' : 'error'}">
        <h3>📊 Overall Performance</h3>
        <p><strong>Average Load Time:</strong> ${this.results.summary.averageLoadTime?.toFixed(2) || 'N/A'}ms</p>
        <p><strong>Tests Passed:</strong> ${this.results.summary.passedTests}/${this.results.summary.totalTests}</p>
    </div>
    
    <h2>📈 Page Load Performance</h2>
    <table>
        <tr>
            <th>Page</th>
            <th>Load Time (ms)</th>
            <th>TTFB (ms)</th>
            <th>Resources</th>
            <th>Status</th>
        </tr>
        ${loadTests.map(test => `
        <tr>
            <td>${test.page}</td>
            <td>${test.loadTime}</td>
            <td>${test.metrics.TTFB?.toFixed(2) || 'N/A'}</td>
            <td>${test.resources?.length || 0}</td>
            <td>${test.status === 200 ? '✅' : '❌'}</td>
        </tr>
        `).join('')}
    </table>
    
    ${memoryTest ? `
    <h2>💾 Memory Usage</h2>
    <div class="metric">
        <p><strong>Initial Usage:</strong> ${(memoryTest.initial?.used / 1048576).toFixed(2) || 'N/A'}MB</p>
        <table>
            <tr>
                <th>Page</th>
                <th>Memory Used (MB)</th>
            </tr>
            ${memoryTest.readings?.map(reading => `
            <tr>
                <td>${reading.page}</td>
                <td>${(reading.used / 1048576).toFixed(2)}</td>
            </tr>
            `).join('') || ''}
        </table>
    </div>
    ` : ''}
    
    <h2>🔍 Recommendations</h2>
    <div class="metric">
        <ul>
            ${this.results.summary.averageLoadTime > 3000 ? '<li>⚠️ Consider optimizing page load times - current average is above 3 seconds</li>' : ''}
            ${loadTests.some(t => t.resources && t.resources.length > 50) ? '<li>📦 Some pages load many resources - consider bundling optimization</li>' : ''}
            <li>✅ Continue monitoring Core Web Vitals for user experience</li>
            <li>🚀 Consider implementing service worker for better caching</li>
        </ul>
    </div>
</body>
</html>
    `
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async runFullSuite() {
    try {
      await this.initialize()
      
      // Test page loads
      await this.testPageLoad('http://localhost:3000', 'Home')
      await this.testPageLoad('http://localhost:3000/register', 'Register')
      await this.testPageLoad('http://localhost:3000/recognize', 'Recognize')
      await this.testPageLoad('http://localhost:3000/attendance', 'Attendance')
      
      // Test Face-API performance
      await this.testFaceAPIPerformance()
      
      // Test bundle size
      await this.testBundleSize()
      
      // Test memory usage
      await this.testMemoryUsage()
      
      // Generate report
      const results = this.generateReport()
      
      // Print summary
      console.log('\\n🎯 Performance Test Summary:')
      console.log(`   Average Load Time: ${results.summary.averageLoadTime?.toFixed(2) || 'N/A'}ms`)
      console.log(`   Tests Passed: ${results.summary.passedTests}/${results.summary.totalTests}`)
      
      if (results.summary.averageLoadTime < 3000) {
        console.log('✅ Performance: GOOD')
      } else if (results.summary.averageLoadTime < 5000) {
        console.log('⚠️  Performance: NEEDS IMPROVEMENT')
      } else {
        console.log('❌ Performance: POOR')
      }
      
      return results
      
    } catch (error) {
      console.error('❌ Performance test failed:', error)
      throw error
    } finally {
      await this.cleanup()
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PerformanceTester()
  
  tester.runFullSuite()
    .then((results) => {
      console.log('\\n🎉 Performance testing completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Performance testing failed:', error)
      process.exit(1)
    })
}

module.exports = PerformanceTester