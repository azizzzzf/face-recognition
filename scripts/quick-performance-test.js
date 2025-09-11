#!/usr/bin/env node

/**
 * Quick Performance Validation Script
 * Tests the implemented optimizations
 */

const { performance } = require('perf_hooks');

async function quickPerformanceTest() {
  console.log('🚀 Quick Performance Validation Test');
  console.log('=====================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Basic page load times
  console.log('\n📊 Testing Page Load Times...');
  
  const pages = [
    { name: 'Home', url: 'http://localhost:3000' },
    { name: 'Register', url: 'http://localhost:3000/register' },
    { name: 'Recognize', url: 'http://localhost:3000/recognize' },
    { name: 'Manifest', url: 'http://localhost:3000/manifest.json' },
    { name: 'Service Worker', url: 'http://localhost:3000/sw.js' }
  ];

  for (const page of pages) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(page.url, {
        method: 'HEAD',
        timeout: 10000
      });
      
      const loadTime = performance.now() - startTime;
      const result = {
        page: page.name,
        url: page.url,
        loadTime: Math.round(loadTime),
        status: response.status,
        success: response.ok
      };
      
      results.tests.push(result);
      
      const statusIcon = response.ok ? '✅' : '❌';
      const timeColor = loadTime < 1000 ? '🟢' : loadTime < 3000 ? '🟡' : '🔴';
      
      console.log(`   ${statusIcon} ${page.name.padEnd(15)} ${timeColor} ${Math.round(loadTime).toString().padStart(4)}ms (${response.status})`);
      
    } catch (error) {
      console.log(`   ❌ ${page.name.padEnd(15)} 🔴 ERROR (${error.message})`);
      results.tests.push({
        page: page.name,
        url: page.url,
        error: error.message,
        success: false
      });
    }
  }

  // Test 2: Bundle size estimation
  console.log('\n📦 Checking Bundle Files...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const nextDir = path.join(process.cwd(), '.next');
    
    if (fs.existsSync(nextDir)) {
      console.log('   ✅ Next.js build directory exists');
      
      // Check for optimized chunks
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        console.log('   ✅ Static assets directory found');
        
        const chunksDir = path.join(staticDir, 'chunks');
        if (fs.existsSync(chunksDir)) {
          const chunkFiles = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
          console.log(`   📊 Found ${chunkFiles.length} JavaScript chunks`);
          
          // Look for optimized chunks
          const faceApiChunk = chunkFiles.find(f => f.includes('face-api') || f.includes('vladmandic'));
          const supabaseChunk = chunkFiles.find(f => f.includes('supabase'));
          const uiChunk = chunkFiles.find(f => f.includes('ui-components') || f.includes('radix'));
          
          if (faceApiChunk) console.log('   🎯 Face-API chunk detected');
          if (supabaseChunk) console.log('   🎯 Supabase chunk detected'); 
          if (uiChunk) console.log('   🎯 UI components chunk detected');
          
          results.bundleAnalysis = {
            totalChunks: chunkFiles.length,
            hasFaceApiChunk: !!faceApiChunk,
            hasSupabaseChunk: !!supabaseChunk,
            hasUiChunk: !!uiChunk
          };
        }
      }
    } else {
      console.log('   ⚠️  No build directory found - run build first for detailed analysis');
    }
  } catch (error) {
    console.log(`   ⚠️  Bundle analysis error: ${error.message}`);
  }

  // Test 3: Check optimization files
  console.log('\n🔧 Validating Optimization Files...');
  
  const optimizationFiles = [
    { path: 'src/lib/face-api-optimizer.ts', name: 'Face-API Optimizer' },
    { path: 'src/lib/db-optimizer.ts', name: 'Database Optimizer' },
    { path: 'src/lib/performance-benchmark.ts', name: 'Performance Benchmark' },
    { path: 'src/components/PerformanceOptimizer.tsx', name: 'Performance Optimizer Component' },
    { path: 'src/components/DynamicComponents.tsx', name: 'Dynamic Components' },
    { path: 'public/manifest.json', name: 'PWA Manifest' },
    { path: 'public/sw.js', name: 'Service Worker' },
    { path: 'next.config.ts', name: 'Next.js Config' }
  ];

  let optimizationScore = 0;
  const totalOptimizations = optimizationFiles.length;

  for (const file of optimizationFiles) {
    const filePath = path.join(process.cwd(), file.path);
    
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file.name}`);
      optimizationScore++;
    } else {
      console.log(`   ❌ ${file.name} - Missing`);
    }
  }

  // Test 4: Network timing simulation
  console.log('\n🌐 Testing Network Performance...');
  
  try {
    const networkTests = [
      { name: 'API Health Check', url: 'http://localhost:3000/api/health' },
    ];

    for (const test of networkTests) {
      try {
        const startTime = performance.now();
        const response = await fetch(test.url, { 
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        });
        const networkTime = performance.now() - startTime;
        
        if (response.ok) {
          console.log(`   ✅ ${test.name} - ${Math.round(networkTime)}ms`);
        } else {
          console.log(`   ⚠️  ${test.name} - ${response.status} (${Math.round(networkTime)}ms)`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name} - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Network testing error: ${error.message}`);
  }

  // Calculate overall score
  const successfulTests = results.tests.filter(t => t.success).length;
  const testScore = Math.round((successfulTests / results.tests.length) * 100);
  const optimizationPercentage = Math.round((optimizationScore / totalOptimizations) * 100);

  console.log('\n🎯 Performance Summary');
  console.log('======================');
  console.log(`📊 Page Load Tests: ${successfulTests}/${results.tests.length} passed (${testScore}%)`);
  console.log(`🔧 Optimizations: ${optimizationScore}/${totalOptimizations} implemented (${optimizationPercentage}%)`);
  
  const avgLoadTime = results.tests
    .filter(t => t.success && t.loadTime)
    .reduce((sum, t) => sum + t.loadTime, 0) / 
    results.tests.filter(t => t.success && t.loadTime).length;

  if (avgLoadTime) {
    console.log(`⚡ Average Load Time: ${Math.round(avgLoadTime)}ms`);
    
    if (avgLoadTime < 1000) {
      console.log('🎉 EXCELLENT performance - Under 1 second!');
    } else if (avgLoadTime < 3000) {
      console.log('✅ GOOD performance - Under 3 seconds');  
    } else {
      console.log('⚠️  Performance needs improvement - Over 3 seconds');
    }
  }

  // Overall grade
  const overallScore = (testScore + optimizationPercentage) / 2;
  console.log('\n🏆 Overall Optimization Score');
  
  if (overallScore >= 90) {
    console.log(`🥇 EXCELLENT (${Math.round(overallScore)}%) - Optimizations are working great!`);
  } else if (overallScore >= 75) {
    console.log(`🥈 GOOD (${Math.round(overallScore)}%) - Most optimizations are active`);
  } else if (overallScore >= 60) {
    console.log(`🥉 FAIR (${Math.round(overallScore)}%) - Some optimizations need attention`);
  } else {
    console.log(`❌ NEEDS WORK (${Math.round(overallScore)}%) - Many optimizations are missing`);
  }

  console.log('\n📝 Next Steps:');
  
  if (optimizationPercentage < 100) {
    console.log('   • Implement missing optimization files');
  }
  
  if (avgLoadTime > 3000) {
    console.log('   • Investigate slow page load times');
  }
  
  if (testScore < 100) {
    console.log('   • Fix failing page requests');
  }
  
  console.log('   • Run full benchmark: npm run perf:benchmark');
  console.log('   • Build and test production: npm run build && npm run start');

  return results;
}

// Run the test if called directly
if (require.main === module) {
  quickPerformanceTest()
    .then((results) => {
      console.log('\n✅ Quick performance test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Performance test failed:', error);
      process.exit(1);
    });
}

module.exports = quickPerformanceTest;