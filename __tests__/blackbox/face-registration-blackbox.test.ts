/**
 * Blackbox Testing - Face Registration Flow
 * Tests face registration functionality without looking at implementation details
 */

import { describe, test, beforeEach, afterAll } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';
import path from 'path';
import fs from 'fs';

describe('Blackbox Testing - Face Registration Flow', () => {
  let browser: Browser;
  let page: Page;
  let reporter: TestReporter;
  let results: TestResult[] = [];

  // Test image paths
  const testImages = {
    validFace: path.join(__dirname, '../fixtures/images/valid-face.jpg'),
    blurryFace: path.join(__dirname, '../fixtures/images/blurry-face.jpg'),
    multipleFaces: path.join(__dirname, '../fixtures/images/multiple-faces.jpg'),
    noFace: path.join(__dirname, '../fixtures/images/landscape.jpg'),
    largeFace: path.join(__dirname, '../fixtures/images/large-face.jpg'),
    invalidFormat: path.join(__dirname, '../fixtures/images/document.pdf'),
    profileFace: path.join(__dirname, '../fixtures/images/profile-face.jpg'),
    maskedFace: path.join(__dirname, '../fixtures/images/masked-face.jpg')
  };

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Grant camera permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(TestConfig.baseUrl, ['camera']);
    
    reporter = new TestReporter();
    
    // Setup test images if they don't exist
    await setupTestImages();
    
    // Login first
    await loginAsTestUser();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    
    const reports = reporter.generateAllReports('face-registration-blackbox-results');
    console.log('📊 Blackbox Face Registration Test Reports generated:');
    console.log(`   HTML: ${reports.html}`);
    console.log(`   JSON: ${reports.json}`);
    console.log(`   CSV: ${reports.csv}`);
  });

  const setupTestImages = async (): Promise<void> => {
    const imagesDir = path.dirname(testImages.validFace);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Create dummy test images if they don't exist
    const imagesToCreate = [
      { path: testImages.validFace, width: 800, height: 600, color: '#FFB6C1' },
      { path: testImages.blurryFace, width: 400, height: 300, color: '#E0E0E0' },
      { path: testImages.multipleFaces, width: 1000, height: 600, color: '#90EE90' },
      { path: testImages.noFace, width: 1200, height: 800, color: '#87CEEB' },
      { path: testImages.largeFace, width: 4000, height: 3000, color: '#DDA0DD' },
      { path: testImages.profileFace, width: 600, height: 800, color: '#F0E68C' },
      { path: testImages.maskedFace, width: 640, height: 480, color: '#FFA07A' }
    ];

    // Generate simple colored rectangles as test images using Canvas API in headless browser
    for (const img of imagesToCreate) {
      if (!fs.existsSync(img.path)) {
        await generateTestImage(img.path, img.width, img.height, img.color);
      }
    }

    // Create a dummy PDF file
    if (!fs.existsSync(testImages.invalidFormat)) {
      fs.writeFileSync(testImages.invalidFormat, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF');
    }
  };

  const generateTestImage = async (filePath: string, width: number, height: number, color: string): Promise<void> => {
    const canvas = `
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = ${width};
      canvas.height = ${height};
      ctx.fillStyle = '${color}';
      ctx.fillRect(0, 0, ${width}, ${height});
      
      // Add a simple face-like shape for valid face image
      if ('${filePath}'.includes('valid-face')) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(${width/2}, ${height/2}, ${width/4}, ${height/3}, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(${width/2 - width/8}, ${height/2 - height/8}, ${width/20}, ${height/20}, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(${width/2 + width/8}, ${height/2 - height/8}, ${width/20}, ${height/20}, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      return canvas.toDataURL('image/jpeg', 0.8);
    `;

    const dataUrl = await page.evaluate(canvas) as string;
    const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  };

  const loginAsTestUser = async (): Promise<void> => {
    await page.goto(`${TestConfig.baseUrl}/auth/login`);
    await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
    await page.type('[name="password"]', TestConfig.testUsers.regularUser.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('[type="submit"]')
    ]);
  };

  const executeTest = async (
    testId: string,
    testCase: string,
    description: string,
    expectedResult: string,
    testFunction: () => Promise<{ actualResult: string; success: boolean; error?: string }>
  ): Promise<void> => {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const testResult = await testFunction();
      const executionTime = Date.now() - startTime;
      
      const screenshotPath = path.join(TestConfig.paths.screenshots, `${testId}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      result = {
        id: testId,
        testCase,
        description,
        expectedResult,
        actualResult: testResult.actualResult,
        status: testResult.success ? 'Berhasil' : 'Tidak Berhasil',
        executionTime,
        screenshot: screenshotPath,
        errorMessage: testResult.error,
        category: 'Face Registration Flow',
        timestamp: new Date()
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      result = {
        id: testId,
        testCase,
        description,
        expectedResult,
        actualResult: `Test execution failed: ${error}`,
        status: 'Tidak Berhasil',
        executionTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        category: 'Face Registration Flow',
        timestamp: new Date()
      };
    }

    results.push(result);
    reporter.addResult(result);

    const statusEmoji = result.status === 'Berhasil' ? '✅' : '❌';
    console.log(`${statusEmoji} [${testId}] ${testCase}: ${result.status}`);
    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }
  };

  test('BB-FACE-026: Upload foto wajah dengan format JPG', async () => {
    await executeTest(
      'BB-FACE-026',
      'Upload foto JPG',
      'User upload foto wajah dengan format JPG yang valid',
      'Foto berhasil diupload, preview muncul, tombol register aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Find file input
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
          return { actualResult: 'File input tidak ditemukan', success: false };
        }

        // Upload file
        await fileInput.uploadFile(testImages.validFace);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {}); // Wait for processing

        // Check for preview
        const preview = await page.$('[data-testid="image-preview"], .image-preview, img[src*="blob:"]') !== null;
        
        // Check if register button is enabled
        const registerButton = await page.$('[data-testid="register-button"], button[type="submit"]');
        const isButtonEnabled = registerButton ? await page.evaluate((btn) => !(btn as HTMLButtonElement).disabled, registerButton) : false;

        // Check for success indicators
        const successIndicator = await page.$('.upload-success, .text-green-500') !== null;

        if (preview && (isButtonEnabled || successIndicator)) {
          return {
            actualResult: 'Foto JPG berhasil diupload, preview muncul, dan tombol register aktif',
            success: true
          };
        } else {
          return {
            actualResult: `Upload gagal - Preview: ${preview}, Button enabled: ${isButtonEnabled}, Success: ${successIndicator}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-027: Upload foto dengan format tidak didukung', async () => {
    await executeTest(
      'BB-FACE-027',
      'Upload file PDF',
      'User upload file PDF sebagai foto wajah',
      'Error "Format not supported", upload gagal',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
          return { actualResult: 'File input tidak ditemukan', success: false };
        }

        await fileInput.uploadFile(testImages.invalidFormat);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        // Check for error message
        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');

        // Check if upload was rejected
        const preview = await page.$('[data-testid="image-preview"], .image-preview, img[src*="blob:"]') === null;

        const hasFormatError = errorMessage && (
          errorMessage.toLowerCase().includes('format') ||
          errorMessage.toLowerCase().includes('supported') ||
          errorMessage.toLowerCase().includes('invalid')
        );

        if (hasFormatError && preview) {
          return {
            actualResult: `Format PDF ditolak dengan error: "${errorMessage}"`,
            success: true
          };
        } else {
          return {
            actualResult: `PDF diterima atau error tidak tepat - Error: "${errorMessage}", No preview: ${preview}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-028: Upload foto berukuran besar', async () => {
    await executeTest(
      'BB-FACE-028',
      'Upload foto besar >10MB',
      'User upload foto yang berukuran lebih dari batas maksimum',
      'Error "File too large", upload gagal dengan pesan jelas',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Create a large dummy file (simulate >10MB)
        const largeFilePath = path.join(__dirname, '../fixtures/images/large-test-file.jpg');
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
        fs.writeFileSync(largeFilePath, largeBuffer);

        try {
          const fileInput = await page.$('input[type="file"]');
          await fileInput?.uploadFile(largeFilePath);
          await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

          const errorMessage = await page.$eval(
            '.error-message, .alert-error, [role="alert"], .text-red-500',
            el => el.textContent
          ).catch(() => '');

          const hasLargeFileError = errorMessage && (
            errorMessage.toLowerCase().includes('large') ||
            errorMessage.toLowerCase().includes('size') ||
            errorMessage.toLowerCase().includes('limit')
          );

          if (hasLargeFileError) {
            return {
              actualResult: `File besar ditolak dengan error: "${errorMessage}"`,
              success: true
            };
          } else {
            return {
              actualResult: `File besar diterima atau error tidak tepat - Error: "${errorMessage}"`,
              success: false
            };
          }
        } finally {
          // Cleanup large test file
          if (fs.existsSync(largeFilePath)) {
            fs.unlinkSync(largeFilePath);
          }
        }
      }
    );
  });

  test('BB-FACE-029: Upload foto tanpa wajah', async () => {
    await executeTest(
      'BB-FACE-029',
      'Upload landscape tanpa wajah',
      'User upload foto landscape yang tidak mengandung wajah',
      'Error "No face detected", foto ditolak',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        const fileInput = await page.$('input[type="file"]');
        await fileInput?.uploadFile(testImages.noFace);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {}); // Wait longer for face detection

        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');

        const hasNoFaceError = errorMessage && (
          errorMessage.toLowerCase().includes('face') ||
          errorMessage.toLowerCase().includes('detected') ||
          errorMessage.toLowerCase().includes('found')
        );

        // Check if register button is disabled
        const registerButton = await page.$('[data-testid="register-button"], button[type="submit"]');
        const isButtonDisabled = registerButton ? await page.evaluate((btn) => (btn as HTMLButtonElement).disabled, registerButton) : true;

        if (hasNoFaceError || isButtonDisabled) {
          return {
            actualResult: `Foto tanpa wajah ditolak - Error: "${errorMessage}", Button disabled: ${isButtonDisabled}`,
            success: true
          };
        } else {
          return {
            actualResult: `Foto tanpa wajah diterima - Error: "${errorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-030: Upload foto dengan multiple wajah', async () => {
    await executeTest(
      'BB-FACE-030',
      'Upload foto multiple wajah',
      'User upload foto yang mengandung lebih dari satu wajah',
      'Error "Multiple faces detected" atau pilihan wajah mana yang akan digunakan',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        const fileInput = await page.$('input[type="file"]');
        await fileInput?.uploadFile(testImages.multipleFaces);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500, .warning-message',
          el => el.textContent
        ).catch(() => '');

        // Check for face selection UI
        const faceSelector = await page.$('[data-testid="face-selector"], .face-selection') !== null;

        const hasMultipleFaceHandling = (errorMessage && (
          errorMessage.toLowerCase().includes('multiple') ||
          errorMessage.toLowerCase().includes('faces')
        )) || faceSelector;

        if (hasMultipleFaceHandling) {
          return {
            actualResult: `Multiple faces dihandle - Error: "${errorMessage}", Face selector: ${faceSelector}`,
            success: true
          };
        } else {
          return {
            actualResult: `Multiple faces tidak dihandle dengan baik - Error: "${errorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-031: Capture foto dari kamera', async () => {
    await executeTest(
      'BB-FACE-031',
      'Capture dari kamera',
      'User menggunakan kamera untuk mengambil foto wajah',
      'Foto berhasil diambil, preview muncul, kualitas cukup',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Look for camera button
        const cameraButton = await page.$('[data-testid="camera-button"], .camera-btn, button[data-action="camera"]');
        
        if (!cameraButton) {
          return { actualResult: 'Tombol kamera tidak ditemukan', success: false };
        }

        await cameraButton.click();
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        // Check if camera stream is active
        const videoElement = await page.$('video') !== null;
        
        // Look for capture button
        const captureButton = await page.$('[data-testid="capture-button"], .capture-btn') !== null;

        if (videoElement && captureButton) {
          // Simulate capture
          await page.click('[data-testid="capture-button"], .capture-btn');
          await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

          // Check for captured image preview
          const preview = await page.$('[data-testid="captured-image"], .captured-preview, canvas') !== null;

          if (preview) {
            return {
              actualResult: 'Kamera berhasil capture foto dan menampilkan preview',
              success: true
            };
          } else {
            return {
              actualResult: 'Capture gagal, preview tidak muncul',
              success: false
            };
          }
        } else {
          return {
            actualResult: `Kamera tidak aktif - Video: ${videoElement}, Capture button: ${captureButton}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-032: Drag & drop foto ke upload area', async () => {
    await executeTest(
      'BB-FACE-032',
      'Drag & drop upload',
      'User drag & drop foto ke area upload',
      'Foto berhasil diupload melalui drag & drop',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Find upload area
        const uploadArea = await page.$('[data-testid="upload-area"], .upload-zone, .dropzone');
        
        if (!uploadArea) {
          return { actualResult: 'Upload area tidak ditemukan', success: false };
        }

        // Simulate drag & drop
        const filePath = testImages.validFace;
        const fileBuffer = fs.readFileSync(filePath);
        
        // Create a DataTransfer object simulation
        await page.evaluate(async (fileData, fileName) => {
          const uploadArea = document.querySelector('[data-testid="upload-area"], .upload-zone, .dropzone');
          if (uploadArea) {
            const file = new File([new Uint8Array(fileData)], fileName, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            const dropEvent = new DragEvent('drop', {
              dataTransfer: dataTransfer,
              bubbles: true
            });
            
            uploadArea.dispatchEvent(dropEvent);
          }
        }, Array.from(fileBuffer), path.basename(filePath));

        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        // Check for successful upload indicators
        const preview = await page.$('[data-testid="image-preview"], .image-preview, img[src*="blob:"]') !== null;
        const successMessage = await page.$('.upload-success, .text-green-500') !== null;

        if (preview || successMessage) {
          return {
            actualResult: `Drag & drop berhasil - Preview: ${preview}, Success: ${successMessage}`,
            success: true
          };
        } else {
          return {
            actualResult: 'Drag & drop gagal, tidak ada indikator sukses',
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-033: Progress indicator saat upload', async () => {
    await executeTest(
      'BB-FACE-033',
      'Upload progress indicator',
      'User upload foto dan melihat progress indicator',
      'Progress bar muncul dan akurat selama upload',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Monitor for progress indicators
        let progressIndicatorFound = false;
        let loadingIndicatorFound = false;

        // Setup listeners for progress elements
        page.on('response', async (response) => {
          if (response.url().includes('/upload') || response.url().includes('/face')) {
            await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
            const progressBar = await page.$('[data-testid="progress-bar"], .progress-bar, progress') !== null;
            const loadingSpinner = await page.$('[data-testid="loading"], .loading, .spinner') !== null;
            
            if (progressBar) progressIndicatorFound = true;
            if (loadingSpinner) loadingIndicatorFound = true;
          }
        });

        const fileInput = await page.$('input[type="file"]');
        await fileInput?.uploadFile(testImages.largeFace); // Use larger file to see progress
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        if (progressIndicatorFound || loadingIndicatorFound) {
          return {
            actualResult: `Progress indicator muncul - Progress bar: ${progressIndicatorFound}, Loading: ${loadingIndicatorFound}`,
            success: true
          };
        } else {
          return {
            actualResult: 'Tidak ada progress indicator selama upload',
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-034: Cancel registration di tengah proses', async () => {
    await executeTest(
      'BB-FACE-034',
      'Cancel registration',
      'User cancel proses registrasi wajah di tengah jalan',
      'Proses terhenti, data temporary terhapus',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Start upload process
        const fileInput = await page.$('input[type="file"]');
        await fileInput?.uploadFile(testImages.validFace);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        // Look for cancel button
        const cancelButton = await page.$('[data-testid="cancel-button"], .cancel-btn, button[data-action="cancel"]');
        
        if (cancelButton) {
          await cancelButton.click();
          await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

          // Check if process was cancelled
          const preview = await page.$('[data-testid="image-preview"], .image-preview, img[src*="blob:"]') === null;
          const registerButton = await page.$('[data-testid="register-button"], button[type="submit"]');
          const isButtonDisabled = registerButton ? await page.evaluate((btn) => (btn as HTMLButtonElement).disabled, registerButton) : true;

          if (preview && isButtonDisabled) {
            return {
              actualResult: 'Proses cancel berhasil, preview dihapus dan button disabled',
              success: true
            };
          } else {
            return {
              actualResult: `Cancel tidak berfungsi - No preview: ${preview}, Button disabled: ${isButtonDisabled}`,
              success: false
            };
          }
        } else {
          return {
            actualResult: 'Cancel button tidak ditemukan',
            success: false
          };
        }
      }
    );
  });

  test('BB-FACE-035: Network error saat upload', async () => {
    await executeTest(
      'BB-FACE-035',
      'Network error handling',
      'Simulasi network error saat upload foto',
      'Error handling yang baik, retry option tersedia',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/register`);
        
        // Intercept and fail network requests
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          if (request.url().includes('/upload') || request.url().includes('/face')) {
            request.abort();
          } else {
            request.continue();
          }
        });

        const fileInput = await page.$('input[type="file"]');
        await fileInput?.uploadFile(testImages.validFace);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

        // Check for error message
        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');

        // Check for retry option
        const retryButton = await page.$('[data-testid="retry-button"], .retry-btn') !== null;

        const hasNetworkError = errorMessage && (
          errorMessage.toLowerCase().includes('network') ||
          errorMessage.toLowerCase().includes('connection') ||
          errorMessage.toLowerCase().includes('failed')
        );

        if ((hasNetworkError || errorMessage) && retryButton) {
          return {
            actualResult: `Network error handled dengan retry option - Error: "${errorMessage}", Retry: ${retryButton}`,
            success: true
          };
        } else {
          return {
            actualResult: `Network error tidak dihandle dengan baik - Error: "${errorMessage}", Retry: ${retryButton}`,
            success: false
          };
        }
      }
    );
  });

  // Additional face registration tests would continue here...
  // This covers the main scenarios for face registration flow
});