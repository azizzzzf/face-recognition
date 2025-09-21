/**
 * Blackbox Testing - Face Recognition Page Functions  
 * Testing face recognition functionality from user perspective (Input → Output)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import fetch from 'node-fetch';
import FormData from 'form-data';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';

describe('Blackbox Testing - Face Recognition Page Functions', () => {
  let reporter: TestReporter;
  const results: TestResult[] = [];

  beforeAll(async () => {
    reporter = new TestReporter();
    console.log('🎯 Starting Face Recognition Functions Blackbox Testing');
  });

  afterAll(async () => {
    const reports = reporter.generateAllReports('face-recognition-functions-blackbox');
    console.log('📊 Face Recognition Functions Test Reports:');
    console.log(`   HTML: ${reports.html}`);
    console.log(`   JSON: ${reports.json}`);
    console.log(`   CSV: ${reports.csv}`);
  });

  const executeTest = async (
    testId: string,
    testCase: string,
    input: any,
    expectedOutput: any,
    testFunction: () => Promise<{ actualOutput: any; success: boolean; error?: string }>
  ) => {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const executionTime = Date.now() - startTime;

      const testResult: TestResult = {
        id: testId,
        testCase,
        description: `Input: ${JSON.stringify(input, null, 2)}`,
        expectedResult: `Output: ${JSON.stringify(expectedOutput, null, 2)}`,
        actualResult: `Output: ${JSON.stringify(result.actualOutput, null, 2)}`,
        status: result.success ? 'Berhasil' : 'Tidak Berhasil',
        executionTime,
        category: 'Face Recognition Functions',
        timestamp: new Date(),
        errorMessage: result.error
      };

      results.push(testResult);
      reporter.addResult(testResult);

      const statusEmoji = result.success ? '✅' : '❌';
      console.log(`${statusEmoji} [${testId}] ${testCase}: ${testResult.status}`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const testResult: TestResult = {
        id: testId,
        testCase,
        description: `Input: ${JSON.stringify(input, null, 2)}`,
        expectedResult: `Output: ${JSON.stringify(expectedOutput, null, 2)}`,
        actualResult: `Error: ${error}`,
        status: 'Tidak Berhasil',
        executionTime,
        category: 'Face Recognition Functions',
        timestamp: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      results.push(testResult);
      reporter.addResult(testResult);
      console.log(`❌ [${testId}] ${testCase}: Error - ${error}`);
    }
  };

  // Helper function to create test image buffer
  const createTestImageBuffer = (type: 'registered' | 'unregistered' | 'blurry' | 'multiple'): Buffer => {
    const buffer = Buffer.alloc(1024 * 100); // 100KB
    
    // Add simple JPEG header
    buffer.writeUInt16BE(0xFFD8, 0); // JPEG SOI marker
    buffer.writeUInt16BE(0xFFD9, buffer.length - 2); // JPEG EOI marker
    
    // Add type-specific content for simulation
    const typeMarker = Buffer.from(type);
    typeMarker.copy(buffer, 10);
    
    return buffer;
  };

  test('FACE-REC-01: Face Recognition Function - Registered Face', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'registered',
      expectedUser: 'known-user'
    };

    const expectedOutput = {
      success: true,
      faceRecognized: true,
      userId: 'known-user',
      confidence: 0.95,
      attendanceRecorded: true
    };

    await executeTest(
      'FACE-REC-01',
      'Registered Face Recognition Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('registered');
        
        formData.append('image', imageBuffer, {
          filename: 'recognize-face.jpg',
          contentType: 'image/jpeg'
        });

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          userId: data.user?.id || data.userId,
          confidence: data.confidence || 0,
          attendanceRecorded: !!(data.attendanceId || data.attendance)
        };

        const success = actualOutput.success &&
                        actualOutput.faceRecognized &&
                        actualOutput.userId &&
                        actualOutput.confidence >= 0.8;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-02: Face Recognition Function - Unregistered Face', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'unregistered',
      expectedUser: null
    };

    const expectedOutput = {
      success: false,
      faceRecognized: false,
      errorMessage: 'Face not recognized',
      attendanceRecorded: false
    };

    await executeTest(
      'FACE-REC-02',
      'Unregistered Face Recognition Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('unregistered');
        
        formData.append('image', imageBuffer, {
          filename: 'unknown-face.jpg',
          contentType: 'image/jpeg'
        });

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          errorMessage: data.error || data.message || (data.recognized ? null : 'Face not recognized'),
          attendanceRecorded: !!(data.attendanceId || data.attendance)
        };

        const success = !actualOutput.faceRecognized &&
                        !actualOutput.attendanceRecorded &&
                        actualOutput.errorMessage &&
                        actualOutput.errorMessage.toLowerCase().includes('not');

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-03: Face Recognition Function - Low Confidence Match', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'low_confidence',
      expectedConfidence: 0.6
    };

    const expectedOutput = {
      success: false,
      faceRecognized: false,
      errorMessage: 'Confidence too low',
      confidence: 0.6,
      attendanceRecorded: false
    };

    await executeTest(
      'FACE-REC-03',
      'Low Confidence Recognition Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('registered');
        
        // Add parameter to simulate low confidence
        formData.append('image', imageBuffer, {
          filename: 'low-confidence-face.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('simulateConfidence', '0.6');

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.confidence >= 0.8),
          errorMessage: data.error || data.message || (data.confidence < 0.8 ? 'Confidence too low' : null),
          confidence: data.confidence || 0,
          attendanceRecorded: !!(data.attendanceId || data.attendance)
        };

        const success = !actualOutput.faceRecognized &&
                        actualOutput.confidence < 0.8 &&
                        !actualOutput.attendanceRecorded;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-04: Image Quality Validation Function - Blurry Image', async () => {
    const input = {
      imageType: 'image/jpeg',
      imageQuality: 'blurry',
      faceStatus: 'registered'
    };

    const expectedOutput = {
      success: false,
      qualityAcceptable: false,
      errorMessage: 'Image quality too low',
      faceRecognized: false
    };

    await executeTest(
      'FACE-REC-04',
      'Blurry Image Quality Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('blurry');
        
        formData.append('image', imageBuffer, {
          filename: 'blurry-face.jpg',
          contentType: 'image/jpeg'
        });

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          qualityAcceptable: !!(data.qualityAcceptable || data.success),
          errorMessage: data.error || data.message,
          faceRecognized: !!(data.recognized && data.user)
        };

        const success = (!actualOutput.success || !actualOutput.qualityAcceptable) &&
                        !actualOutput.faceRecognized &&
                        actualOutput.errorMessage &&
                        actualOutput.errorMessage.toLowerCase().includes('quality');

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-05: Multiple Face Detection Function - Group Photo', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceCount: 3,
      expectedBehavior: 'reject'
    };

    const expectedOutput = {
      success: false,
      faceRecognized: false,
      errorMessage: 'Multiple faces detected',
      faceCount: 3
    };

    await executeTest(
      'FACE-REC-05',
      'Multiple Face Detection Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('multiple');
        
        formData.append('image', imageBuffer, {
          filename: 'group-photo.jpg',
          contentType: 'image/jpeg'
        });

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          errorMessage: data.error || data.message,
          faceCount: data.faceCount || data.faces?.length || 0
        };

        const success = !actualOutput.success &&
                        !actualOutput.faceRecognized &&
                        actualOutput.errorMessage &&
                        actualOutput.errorMessage.toLowerCase().includes('multiple');

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-06: Attendance Recording Function - Successful Recognition', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'registered',
      userId: 'attendance-user',
      timestamp: new Date().toISOString()
    };

    const expectedOutput = {
      success: true,
      faceRecognized: true,
      attendanceRecorded: true,
      attendanceId: 'generated',
      timestamp: 'recorded'
    };

    await executeTest(
      'FACE-REC-06',
      'Attendance Recording Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('registered');
        
        formData.append('image', imageBuffer, {
          filename: 'attendance-face.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('recordAttendance', 'true');

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          attendanceRecorded: !!(data.attendanceId || data.attendance),
          attendanceId: data.attendanceId || data.attendance?.id || 'generated',
          timestamp: data.attendance?.timestamp || data.timestamp || 'recorded'
        };

        const success = actualOutput.success &&
                        actualOutput.faceRecognized &&
                        actualOutput.attendanceRecorded &&
                        actualOutput.attendanceId;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-07: Duplicate Attendance Prevention Function - Same Day Recognition', async () => {
    const userId = 'duplicate-attendance-user';
    
    // First recognition/attendance
    const formData1 = new FormData();
    const imageBuffer1 = createTestImageBuffer('registered');
    formData1.append('image', imageBuffer1, {
      filename: 'first-attendance.jpg',
      contentType: 'image/jpeg'
    });
    formData1.append('userId', userId);

    await fetch(`${TestConfig.apiUrl}/face/recognize`, {
      method: 'POST',
      body: formData1
    });

    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'registered',
      userId: userId,
      sameDay: true
    };

    const expectedOutput = {
      success: true,
      faceRecognized: true,
      attendanceRecorded: false,
      warningMessage: 'Already recorded today'
    };

    await executeTest(
      'FACE-REC-07',
      'Duplicate Attendance Prevention Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('registered');
        
        formData.append('image', imageBuffer, {
          filename: 'duplicate-attendance.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', input.userId);

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          attendanceRecorded: !!(data.attendanceId || data.attendance),
          warningMessage: data.warning || data.message || (data.duplicate ? 'Already recorded today' : null)
        };

        const success = actualOutput.faceRecognized &&
                        !actualOutput.attendanceRecorded &&
                        actualOutput.warningMessage &&
                        actualOutput.warningMessage.toLowerCase().includes('already');

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-08: Recognition History Function - User Recognition Log', async () => {
    const input = {
      userId: 'history-user',
      dateRange: '7days'
    };

    const expectedOutput = {
      success: true,
      hasHistory: true,
      recognitionCount: 5,
      attendanceRecords: []
    };

    await executeTest(
      'FACE-REC-08',
      'Recognition History Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/face/history/${input.userId}?days=7`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          hasHistory: !!(data.history && data.history.length > 0),
          recognitionCount: data.history ? data.history.length : 0,
          attendanceRecords: data.history || data.records || []
        };

        const success = actualOutput.success;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-09: Recognition Statistics Function - User Stats', async () => {
    const input = {
      userId: 'stats-user',
      period: 'monthly'
    };

    const expectedOutput = {
      success: true,
      hasStats: true,
      totalRecognitions: 20,
      attendanceRate: 85,
      lastRecognition: '2024-01-15'
    };

    await executeTest(
      'FACE-REC-09',
      'Recognition Statistics Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/face/stats/${input.userId}?period=monthly`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          hasStats: !!(data.stats || data.statistics),
          totalRecognitions: data.stats?.total || data.total || 0,
          attendanceRate: data.stats?.rate || data.rate || 0,
          lastRecognition: data.stats?.lastDate || data.lastRecognition
        };

        const success = actualOutput.success && actualOutput.hasStats;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REC-10: Real-time Recognition Function - Live Recognition', async () => {
    const input = {
      imageType: 'image/jpeg',
      faceStatus: 'registered',
      mode: 'realtime',
      responseTime: 'fast'
    };

    const expectedOutput = {
      success: true,
      faceRecognized: true,
      responseTime: '<2000ms',
      realTimeCompatible: true
    };

    await executeTest(
      'FACE-REC-10',
      'Real-time Recognition Function',
      input,
      expectedOutput,
      async () => {
        const startTime = Date.now();
        
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('registered');
        
        formData.append('image', imageBuffer, {
          filename: 'realtime-face.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('mode', 'realtime');

        const response = await fetch(`${TestConfig.apiUrl}/face/recognize`, {
          method: 'POST',
          body: formData
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          faceRecognized: !!(data.recognized && data.user),
          responseTime: `${responseTime}ms`,
          realTimeCompatible: responseTime < 2000
        };

        const success = actualOutput.success &&
                        actualOutput.realTimeCompatible &&
                        actualOutput.faceRecognized;

        return { actualOutput, success };
      }
    );
  });
});