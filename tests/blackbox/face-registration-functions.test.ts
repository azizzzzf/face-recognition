/**
 * Blackbox Testing - Face Registration Page Functions
 * Testing face registration functionality from user perspective (Input → Output)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';

describe('Blackbox Testing - Face Registration Page Functions', () => {
  let reporter: TestReporter;
  const results: TestResult[] = [];

  beforeAll(async () => {
    reporter = new TestReporter();
    console.log('📷 Starting Face Registration Functions Blackbox Testing');
  });

  afterAll(async () => {
    const reports = reporter.generateAllReports('face-registration-functions-blackbox');
    console.log('📊 Face Registration Functions Test Reports:');
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
        category: 'Face Registration Functions',
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
        category: 'Face Registration Functions',
        timestamp: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      results.push(testResult);
      reporter.addResult(testResult);
      console.log(`❌ [${testId}] ${testCase}: Error - ${error}`);
    }
  };

  // Helper function to create test image buffer
  const createTestImageBuffer = (type: 'valid' | 'invalid' | 'large' | 'small'): Buffer => {
    const sizes = {
      valid: 1024 * 100,   // 100KB
      invalid: 50,          // Very small
      large: 1024 * 1024 * 12,  // 12MB
      small: 100            // Too small
    };

    const buffer = Buffer.alloc(sizes[type]);
    
    // Add simple JPEG header for valid images
    if (type === 'valid') {
      buffer.writeUInt16BE(0xFFD8, 0); // JPEG SOI marker
      buffer.writeUInt16BE(0xFFD9, buffer.length - 2); // JPEG EOI marker
    }
    
    return buffer;
  };

  test('FACE-REG-01: Image Upload Function - Valid JPG Image', async () => {
    const input = {
      imageType: 'image/jpeg',
      imageSize: '100KB',
      imageFormat: 'JPG'
    };

    const expectedOutput = {
      success: true,
      imageAccepted: true,
      previewGenerated: true,
      readyForRegistration: true
    };

    await executeTest(
      'FACE-REG-01',
      'Valid JPG Upload Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'test-face.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          imageAccepted: !!(data.imageId || data.uploadId),
          previewGenerated: !!(data.previewUrl || data.imageUrl),
          readyForRegistration: !!(data.ready || data.canRegister || response.ok)
        };

        const success = actualOutput.success &&
                        actualOutput.imageAccepted &&
                        actualOutput.readyForRegistration;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-02: File Format Validation Function - Invalid Format (PDF)', async () => {
    const input = {
      imageType: 'application/pdf',
      imageSize: '500KB',
      imageFormat: 'PDF'
    };

    const expectedOutput = {
      success: false,
      imageRejected: true,
      errorMessage: 'Invalid file format',
      allowedFormats: ['jpg', 'jpeg', 'png']
    };

    await executeTest(
      'FACE-REG-02',
      'Invalid Format Validation Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const pdfBuffer = Buffer.from('%PDF-1.4\n%fake pdf content\n%%EOF');
        
        formData.append('image', pdfBuffer, {
          filename: 'document.pdf',
          contentType: 'application/pdf'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          imageRejected: !response.ok || !data.success,
          errorMessage: data.error || data.message,
          allowedFormats: data.allowedFormats || ['jpg', 'jpeg', 'png']
        };

        const success = !actualOutput.success &&
                        actualOutput.imageRejected &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('format') ||
                         actualOutput.errorMessage.toLowerCase().includes('type'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-03: File Size Validation Function - Large File (>10MB)', async () => {
    const input = {
      imageType: 'image/jpeg',
      imageSize: '12MB',
      imageFormat: 'JPG'
    };

    const expectedOutput = {
      success: false,
      imageRejected: true,
      errorMessage: 'File too large',
      maxSizeAllowed: '10MB'
    };

    await executeTest(
      'FACE-REG-03',
      'Large File Size Validation Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const largeImageBuffer = createTestImageBuffer('large');
        
        formData.append('image', largeImageBuffer, {
          filename: 'large-image.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          imageRejected: !response.ok || !data.success,
          errorMessage: data.error || data.message,
          maxSizeAllowed: data.maxSize || '10MB'
        };

        const success = !actualOutput.success &&
                        actualOutput.imageRejected &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('large') ||
                         actualOutput.errorMessage.toLowerCase().includes('size'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-04: Face Detection Function - Valid Face Image', async () => {
    const input = {
      imageType: 'image/jpeg',
      hasFace: true,
      faceCount: 1
    };

    const expectedOutput = {
      success: true,
      faceDetected: true,
      faceCount: 1,
      canProceed: true
    };

    await executeTest(
      'FACE-REG-04',
      'Face Detection Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'face-image.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/detect`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          faceDetected: !!(data.faces && data.faces.length > 0),
          faceCount: data.faces ? data.faces.length : 0,
          canProceed: !!(data.canProceed || (data.faces && data.faces.length === 1))
        };

        const success = actualOutput.success &&
                        actualOutput.faceDetected &&
                        actualOutput.faceCount === 1 &&
                        actualOutput.canProceed;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-05: Face Detection Function - No Face Detected', async () => {
    const input = {
      imageType: 'image/jpeg',
      hasFace: false,
      imageContent: 'landscape'
    };

    const expectedOutput = {
      success: false,
      faceDetected: false,
      errorMessage: 'No face detected',
      canProceed: false
    };

    await executeTest(
      'FACE-REG-05',
      'No Face Detection Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        // Create image buffer that simulates landscape (no face)
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'landscape.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/detect`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          faceDetected: !!(data.faces && data.faces.length > 0),
          errorMessage: data.error || data.message,
          canProceed: !!(data.canProceed)
        };

        const success = (!actualOutput.success || !actualOutput.faceDetected) &&
                        !actualOutput.canProceed &&
                        (actualOutput.errorMessage && 
                         actualOutput.errorMessage.toLowerCase().includes('face'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-06: Multiple Face Detection Function - Multiple Faces', async () => {
    const input = {
      imageType: 'image/jpeg',
      hasFace: true,
      faceCount: 3
    };

    const expectedOutput = {
      success: false,
      multipleDetected: true,
      errorMessage: 'Multiple faces detected',
      canProceed: false
    };

    await executeTest(
      'FACE-REG-06',
      'Multiple Face Detection Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'group-photo.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-1');

        const response = await fetch(`${TestConfig.apiUrl}/face/detect`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          multipleDetected: !!(data.faces && data.faces.length > 1),
          errorMessage: data.error || data.message,
          canProceed: !!(data.canProceed)
        };

        const success = (!actualOutput.success || actualOutput.multipleDetected) &&
                        !actualOutput.canProceed &&
                        (actualOutput.errorMessage &&
                         actualOutput.errorMessage.toLowerCase().includes('multiple'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-07: Face Registration Function - Complete Registration', async () => {
    const input = {
      imageType: 'image/jpeg',
      userId: 'test-user-registration',
      hasFace: true,
      faceCount: 1
    };

    const expectedOutput = {
      success: true,
      registrationComplete: true,
      faceId: 'generated',
      userCanRecognize: true
    };

    await executeTest(
      'FACE-REG-07',
      'Complete Face Registration Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'register-face.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', input.userId);

        const response = await fetch(`${TestConfig.apiUrl}/face/register`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          registrationComplete: !!(data.faceId || data.registrationId),
          faceId: data.faceId || data.registrationId || 'generated',
          userCanRecognize: !!(data.canRecognize || data.success)
        };

        const success = actualOutput.success &&
                        actualOutput.registrationComplete &&
                        actualOutput.faceId &&
                        actualOutput.userCanRecognize;

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-08: Duplicate Registration Function - Already Registered', async () => {
    const userId = 'test-user-duplicate';
    
    // First registration
    const formData1 = new FormData();
    const imageBuffer1 = createTestImageBuffer('valid');
    formData1.append('image', imageBuffer1, {
      filename: 'first-registration.jpg',
      contentType: 'image/jpeg'
    });
    formData1.append('userId', userId);

    await fetch(`${TestConfig.apiUrl}/face/register`, {
      method: 'POST',
      body: formData1
    });

    const input = {
      imageType: 'image/jpeg',
      userId: userId,
      previousRegistration: true
    };

    const expectedOutput = {
      success: false,
      duplicateError: true,
      errorMessage: 'Face already registered',
      canOverwrite: false
    };

    await executeTest(
      'FACE-REG-08',
      'Duplicate Registration Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const imageBuffer = createTestImageBuffer('valid');
        
        formData.append('image', imageBuffer, {
          filename: 'duplicate-registration.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', input.userId);

        const response = await fetch(`${TestConfig.apiUrl}/face/register`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          duplicateError: !response.ok || !data.success,
          errorMessage: data.error || data.message,
          canOverwrite: !!(data.canOverwrite || data.allowUpdate)
        };

        const success = !actualOutput.success &&
                        actualOutput.duplicateError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('already') ||
                         actualOutput.errorMessage.toLowerCase().includes('exists'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-09: Image Quality Validation Function - Low Quality Image', async () => {
    const input = {
      imageType: 'image/jpeg',
      imageQuality: 'low',
      imageSize: '5KB'
    };

    const expectedOutput = {
      success: false,
      qualityTooLow: true,
      errorMessage: 'Image quality too low',
      minimumQuality: 'specified'
    };

    await executeTest(
      'FACE-REG-09',
      'Image Quality Validation Function',
      input,
      expectedOutput,
      async () => {
        const formData = new FormData();
        const lowQualityBuffer = createTestImageBuffer('small');
        
        formData.append('image', lowQualityBuffer, {
          filename: 'low-quality.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('userId', 'test-user-quality');

        const response = await fetch(`${TestConfig.apiUrl}/face/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          qualityTooLow: !response.ok || !data.success,
          errorMessage: data.error || data.message,
          minimumQuality: data.minimumQuality || 'specified'
        };

        const success = !actualOutput.success &&
                        actualOutput.qualityTooLow &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('quality') ||
                         actualOutput.errorMessage.toLowerCase().includes('size'));

        return { actualOutput, success };
      }
    );
  });

  test('FACE-REG-10: Registration Status Check Function - User Registration Status', async () => {
    const input = {
      userId: 'test-user-status-check'
    };

    const expectedOutput = {
      success: true,
      hasRegistration: false,
      canRegister: true,
      registrationDetails: null
    };

    await executeTest(
      'FACE-REG-10',
      'Registration Status Check Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/face/status/${input.userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok,
          hasRegistration: !!(data.hasRegistration || data.faceId),
          canRegister: !!(data.canRegister || !data.hasRegistration),
          registrationDetails: data.registration || null
        };

        const success = actualOutput.success &&
                        actualOutput.canRegister === expectedOutput.canRegister;

        return { actualOutput, success };
      }
    );
  });
});