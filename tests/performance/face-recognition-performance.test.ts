/**
 * Performance Testing - Face Recognition
 * Tests performance, load, and resource usage of face recognition features
 */

import { describe, test, beforeEach, afterAll } from '@jest/globals';
import { performance } from 'perf_hooks';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';
import path from 'path';
import fs from 'fs';

describe('Performance Testing - Face Recognition', () => {
  let reporter: TestReporter;
  const results: TestResult[] = [];

  beforeEach(() => {
    reporter = new TestReporter();
  });

  afterAll(() => {
    const reports = reporter.generateAllReports('face-recognition-performance-results');
    console.log('⚡ Face Recognition Performance Test Reports generated:');
    console.log(`   HTML: ${reports.html}`);
    console.log(`   JSON: ${reports.json}`);
    console.log(`   CSV: ${reports.csv}`);
  });

  const executePerformanceTest = async (
    testId: string,
    testCase: string,
    description: string,
    expectedResult: string,
    testFunction: () => Promise<{ actualResult: string; success: boolean; metrics?: any; error?: string }>
  ): Promise<void> => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const testResult = await testFunction();
      const executionTime = Date.now() - startTime;

      result = {
        id: testId,
        testCase,
        description,
        expectedResult,
        actualResult: testResult.actualResult + (testResult.metrics ? ` | Metrics: ${JSON.stringify(testResult.metrics)}` : ''),
        status: testResult.success ? 'Berhasil' : 'Tidak Berhasil',
        executionTime,
        errorMessage: testResult.error,
        category: 'Performance - Face Recognition',
        timestamp: new Date()
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      result = {
        id: testId,
        testCase,
        description,
        expectedResult,
        actualResult: `Performance test failed: ${error}`,
        status: 'Tidak Berhasil',
        executionTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        category: 'Performance - Face Recognition',
        timestamp: new Date()
      };
    }

    results.push(result);
    reporter.addResult(result);

    const statusEmoji = result.status === 'Berhasil' ? '✅' : '⚡';
    console.log(`${statusEmoji} [${testId}] ${testCase}: ${result.status} (${result.executionTime}ms)`);
    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }
  };

  test('PERF-FACE-176: Face recognition response time', async () => {
    await executePerformanceTest(
      'PERF-FACE-176',
      'Face Recognition Speed Test',
      'Mengukur waktu response face recognition dengan foto standar',
      'Recognition completed dalam <3000ms dengan akurasi >80%',
      async () => {
        const testImagePath = path.join(__dirname, '../fixtures/images/test-face.jpg');
        
        // Create test image if doesn't exist
        if (!fs.existsSync(testImagePath)) {
          fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
          // Create a simple test image buffer
          const testBuffer = Buffer.from('fake-image-data-for-testing');
          fs.writeFileSync(testImagePath, testBuffer);
        }

        const iterations = 10;
        const responseTimes: number[] = [];
        let successfulRecognitions = 0;

        for (let i = 0; i < iterations; i++) {
          const startTime = performance.now();
          
          try {
            // Simulate API call to face recognition endpoint
            const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageData: fs.readFileSync(testImagePath, 'base64'),
                userId: 'test-user-id'
              })
            });

            const endTime = performance.now();
            const responseTime = endTime - startTime;
            responseTimes.push(responseTime);

            if (response.ok) {
              const data = await response.json();
              if (data.confidence && data.confidence > 0.8) {
                successfulRecognitions++;
              }
            }
          } catch (error) {
            console.warn(`Recognition attempt ${i + 1} failed:`, error);
          }
        }

        const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxTime = Math.max(...responseTimes);
        const minTime = Math.min(...responseTimes);
        const successRate = (successfulRecognitions / iterations) * 100;

        const metrics = {
          averageTime: Math.round(averageTime),
          maxTime: Math.round(maxTime),
          minTime: Math.round(minTime),
          successRate: successRate.toFixed(1),
          iterations
        };

        if (averageTime < TestConfig.performance.faceRecognitionTime && successRate >= 80) {
          return {
            actualResult: `Face recognition performance excellent - Avg: ${Math.round(averageTime)}ms, Success: ${successRate}%`,
            success: true,
            metrics
          };
        } else {
          return {
            actualResult: `Performance issues detected - Avg: ${Math.round(averageTime)}ms, Success: ${successRate}%`,
            success: false,
            metrics
          };
        }
      }
    );
  });

  test('PERF-FACE-177: Concurrent face recognition load test', async () => {
    await executePerformanceTest(
      'PERF-FACE-177',
      'Concurrent Recognition Load Test',
      'Test performa dengan multiple recognition requests bersamaan',
      'System handle 10 concurrent requests dengan response time <5000ms',
      async () => {
        const concurrentRequests = 10;
        const testImagePath = path.join(__dirname, '../fixtures/images/test-face.jpg');

        if (!fs.existsSync(testImagePath)) {
          fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
          const testBuffer = Buffer.from('fake-concurrent-test-image-data');
          fs.writeFileSync(testImagePath, testBuffer);
        }

        const recognitionPromises = Array.from({ length: concurrentRequests }, async (_, index) => {
          const startTime = performance.now();
          
          try {
            const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageData: fs.readFileSync(testImagePath, 'base64'),
                userId: `concurrent-test-user-${index}`,
                requestId: `concurrent-${index}-${Date.now()}`
              })
            });

            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            return {
              index,
              responseTime,
              status: response.status,
              success: response.ok
            };
          } catch (error) {
            const endTime = performance.now();
            return {
              index,
              responseTime: endTime - startTime,
              status: 0,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            };
          }
        });

        const loadTestStart = performance.now();
        const results = await Promise.all(recognitionPromises);
        const loadTestEnd = performance.now();
        const totalTime = loadTestEnd - loadTestStart;

        const successfulRequests = results.filter(r => r.success).length;
        const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const maxResponseTime = Math.max(...results.map(r => r.responseTime));
        const throughput = (concurrentRequests / totalTime) * 1000; // requests per second

        const metrics = {
          concurrentRequests,
          successfulRequests,
          totalTime: Math.round(totalTime),
          averageResponseTime: Math.round(averageResponseTime),
          maxResponseTime: Math.round(maxResponseTime),
          throughput: throughput.toFixed(2),
          successRate: ((successfulRequests / concurrentRequests) * 100).toFixed(1)
        };

        if (successfulRequests >= concurrentRequests * 0.9 && maxResponseTime < 5000) {
          return {
            actualResult: `Concurrent load handled well - Success: ${successfulRequests}/${concurrentRequests}, Max time: ${Math.round(maxResponseTime)}ms`,
            success: true,
            metrics
          };
        } else {
          return {
            actualResult: `Concurrent load issues - Success: ${successfulRequests}/${concurrentRequests}, Max time: ${Math.round(maxResponseTime)}ms`,
            success: false,
            metrics
          };
        }
      }
    );
  });

  test('PERF-FACE-178: Large image processing performance', async () => {
    await executePerformanceTest(
      'PERF-FACE-178',
      'Large Image Processing',
      'Test performa processing foto dengan resolusi tinggi >5MB',
      'Images >5MB diproses tanpa timeout dalam <10 detik',
      async () => {
        // Create a large test image (simulate 5MB+ image)
        const largeImagePath = path.join(__dirname, '../fixtures/images/large-test-image.jpg');
        const imageSize = 6 * 1024 * 1024; // 6MB
        
        if (!fs.existsSync(path.dirname(largeImagePath))) {
          fs.mkdirSync(path.dirname(largeImagePath), { recursive: true });
        }

        // Create large dummy image buffer
        const largeBuffer = Buffer.alloc(imageSize);
        // Fill with some pattern to simulate actual image data
        for (let i = 0; i < imageSize; i++) {
          largeBuffer[i] = i % 256;
        }
        fs.writeFileSync(largeImagePath, largeBuffer);

        const startTime = performance.now();
        let memoryBefore = 0;
        let memoryAfter = 0;

        if (global.gc) {
          global.gc(); // Force garbage collection if available
          memoryBefore = process.memoryUsage().heapUsed;
        }

        try {
          const imageData = fs.readFileSync(largeImagePath, 'base64');
          
          const response = await fetch(`${TestConfig.apiUrl}/face/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData,
              userId: 'large-image-test-user'
            }),
            // Set longer timeout for large files
            signal: AbortSignal.timeout(15000)
          });

          const endTime = performance.now();
          const processingTime = endTime - startTime;

          if (global.gc) {
            global.gc();
            memoryAfter = process.memoryUsage().heapUsed;
          }

          const memoryUsed = memoryAfter - memoryBefore;
          const fileSizeMB = (imageSize / (1024 * 1024)).toFixed(2);

          const metrics = {
            processingTime: Math.round(processingTime),
            fileSizeMB,
            memoryUsedMB: (memoryUsed / (1024 * 1024)).toFixed(2),
            responseStatus: response.status,
            success: response.ok
          };

          // Cleanup
          if (fs.existsSync(largeImagePath)) {
            fs.unlinkSync(largeImagePath);
          }

          if (processingTime < 10000 && response.ok) {
            return {
              actualResult: `Large image processed successfully in ${Math.round(processingTime)}ms (${fileSizeMB}MB)`,
              success: true,
              metrics
            };
          } else {
            return {
              actualResult: `Large image processing failed - Time: ${Math.round(processingTime)}ms, Status: ${response.status}`,
              success: false,
              metrics
            };
          }
        } catch (error) {
          const endTime = performance.now();
          const processingTime = endTime - startTime;

          // Cleanup
          if (fs.existsSync(largeImagePath)) {
            fs.unlinkSync(largeImagePath);
          }

          return {
            actualResult: `Large image processing error after ${Math.round(processingTime)}ms`,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );
  });

  test('PERF-FACE-179: Database query performance', async () => {
    await executePerformanceTest(
      'PERF-FACE-179',
      'Database Query Performance',
      'Mengukur performa query database untuk face data dan attendance',
      'Query response time <500ms untuk data normal',
      async () => {
        const queries = [
          '/api/users',
          '/api/attendance',
          '/api/face/registrations',
          '/api/statistics/dashboard'
        ];

        const queryResults = [];

        for (const endpoint of queries) {
          const startTime = performance.now();
          
          try {
            const response = await fetch(`${TestConfig.baseUrl}${endpoint}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            const endTime = performance.now();
            const queryTime = endTime - startTime;

            let dataSize = 0;
            if (response.ok) {
              const data = await response.json();
              dataSize = JSON.stringify(data).length;
            }

            queryResults.push({
              endpoint,
              queryTime: Math.round(queryTime),
              status: response.status,
              dataSize,
              success: response.ok
            });
          } catch (error) {
            const endTime = performance.now();
            queryResults.push({
              endpoint,
              queryTime: Math.round(endTime - startTime),
              status: 0,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }

        const averageQueryTime = queryResults.reduce((sum, r) => sum + r.queryTime, 0) / queryResults.length;
        const maxQueryTime = Math.max(...queryResults.map(r => r.queryTime));
        const successfulQueries = queryResults.filter(r => r.success).length;

        const metrics = {
          queries: queryResults.length,
          successfulQueries,
          averageQueryTime: Math.round(averageQueryTime),
          maxQueryTime,
          queryDetails: queryResults
        };

        if (averageQueryTime < TestConfig.performance.apiResponseTime && maxQueryTime < 1000) {
          return {
            actualResult: `Database queries performing well - Avg: ${Math.round(averageQueryTime)}ms, Max: ${maxQueryTime}ms`,
            success: true,
            metrics
          };
        } else {
          return {
            actualResult: `Database query performance issues - Avg: ${Math.round(averageQueryTime)}ms, Max: ${maxQueryTime}ms`,
            success: false,
            metrics
          };
        }
      }
    );
  });

  test('PERF-FACE-180: Memory usage monitoring', async () => {
    await executePerformanceTest(
      'PERF-FACE-180',
      'Memory Usage Monitoring',
      'Monitor memory usage selama operasi face recognition intensif',
      'Memory usage tidak melebihi threshold dan tidak ada memory leaks',
      async () => {
        const initialMemory = process.memoryUsage();
        const memorySnapshots = [initialMemory];

        // Simulate intensive face operations
        const iterations = 20;
        
        for (let i = 0; i < iterations; i++) {
          // Create dummy image data to simulate processing
          const imageBuffer = Buffer.alloc(1024 * 1024); // 1MB
          imageBuffer.fill(i % 256);

          // Simulate face processing operations
          const processedData = {
            imageData: imageBuffer.toString('base64'),
            descriptors: Array.from({ length: 128 }, () => Math.random()),
            landmarks: Array.from({ length: 68 }, () => ({ x: Math.random() * 640, y: Math.random() * 480 })),
            timestamp: Date.now()
          };

          // Force some string operations
          JSON.stringify(processedData);
          
          // Take memory snapshot every 5 iterations
          if (i % 5 === 0) {
            if (global.gc) global.gc(); // Force GC if available
            memorySnapshots.push(process.memoryUsage());
          }
        }

        // Final memory measurement
        if (global.gc) global.gc();
        const finalMemory = process.memoryUsage();
        memorySnapshots.push(finalMemory);

        // Calculate memory metrics
        const heapUsedDiff = finalMemory.heapUsed - initialMemory.heapUsed;
        const heapTotalDiff = finalMemory.heapTotal - initialMemory.heapTotal;
        const maxHeapUsed = Math.max(...memorySnapshots.map(m => m.heapUsed));
        const avgHeapUsed = memorySnapshots.reduce((sum, m) => sum + m.heapUsed, 0) / memorySnapshots.length;

        const metrics = {
          initialMemoryMB: (initialMemory.heapUsed / (1024 * 1024)).toFixed(2),
          finalMemoryMB: (finalMemory.heapUsed / (1024 * 1024)).toFixed(2),
          maxMemoryMB: (maxHeapUsed / (1024 * 1024)).toFixed(2),
          avgMemoryMB: (avgHeapUsed / (1024 * 1024)).toFixed(2),
          heapGrowthMB: (heapUsedDiff / (1024 * 1024)).toFixed(2),
          iterations
        };

        const memoryThresholdMB = TestConfig.performance.memoryUsage / (1024 * 1024);
        const hasMemoryLeak = heapUsedDiff > (50 * 1024 * 1024); // 50MB growth threshold
        const exceedsThreshold = maxHeapUsed > TestConfig.performance.memoryUsage;

        if (!hasMemoryLeak && !exceedsThreshold) {
          return {
            actualResult: `Memory usage within limits - Max: ${(maxHeapUsed / (1024 * 1024)).toFixed(2)}MB, Growth: ${(heapUsedDiff / (1024 * 1024)).toFixed(2)}MB`,
            success: true,
            metrics
          };
        } else {
          return {
            actualResult: `Memory issues detected - Leak: ${hasMemoryLeak}, Threshold exceeded: ${exceedsThreshold}`,
            success: false,
            metrics
          };
        }
      }
    );
  });

  test('PERF-FACE-181: API throughput stress test', async () => {
    await executePerformanceTest(
      'PERF-FACE-181',
      'API Throughput Stress Test',
      'Test API throughput dengan high load sustained requests',
      'API maintain >50 requests/second dengan <5% error rate',
      async () => {
        const testDurationMs = 10000; // 10 seconds
        const requestsPerSecond = 60;
        const intervalMs = 1000 / requestsPerSecond;
        
        const results: Array<{ timestamp: number; responseTime: number; success: boolean; status: number }> = [];
        const startTime = Date.now();
        
        const makeRequest = async (): Promise<void> => {
          const requestStart = performance.now();
          
          try {
            const response = await fetch(`${TestConfig.apiUrl}/health`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            const requestEnd = performance.now();
            
            results.push({
              timestamp: Date.now(),
              responseTime: requestEnd - requestStart,
              success: response.ok,
              status: response.status
            });
          } catch (error) {
            const requestEnd = performance.now();
            results.push({
              timestamp: Date.now(),
              responseTime: requestEnd - requestStart,
              success: false,
              status: 0
            });
          }
        };

        // Start stress test
        const interval = setInterval(makeRequest, intervalMs);
        
        // Run for test duration
        await new Promise(resolve => setTimeout(resolve, testDurationMs));
        clearInterval(interval);

        // Wait for remaining requests to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate metrics
        const totalRequests = results.length;
        const successfulRequests = results.filter(r => r.success).length;
        const errorRate = ((totalRequests - successfulRequests) / totalRequests) * 100;
        const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const actualThroughput = (totalRequests / testDurationMs) * 1000;
        const maxResponseTime = Math.max(...results.map(r => r.responseTime));

        const metrics = {
          totalRequests,
          successfulRequests,
          errorRate: errorRate.toFixed(2),
          averageResponseTime: Math.round(averageResponseTime),
          maxResponseTime: Math.round(maxResponseTime),
          targetThroughput: requestsPerSecond,
          actualThroughput: actualThroughput.toFixed(2),
          testDurationMs
        };

        if (actualThroughput >= 50 && errorRate < 5) {
          return {
            actualResult: `Stress test passed - Throughput: ${actualThroughput.toFixed(2)} req/sec, Error rate: ${errorRate.toFixed(2)}%`,
            success: true,
            metrics
          };
        } else {
          return {
            actualResult: `Stress test failed - Throughput: ${actualThroughput.toFixed(2)} req/sec, Error rate: ${errorRate.toFixed(2)}%`,
            success: false,
            metrics
          };
        }
      }
    );
  });
});