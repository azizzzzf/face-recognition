/**
 * Blackbox Testing - Authentication & Authorization
 * Tests authentication flows without looking at implementation details
 */

import { describe, test, beforeEach, afterAll } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';
import path from 'path';

describe('Blackbox Testing - Authentication & Authorization', () => {
  let browser: Browser;
  let page: Page;
  let reporter: TestReporter;
  let results: TestResult[] = [];

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    reporter = new TestReporter();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    
    // Generate comprehensive reports
    const reports = reporter.generateAllReports('auth-blackbox-results');
    console.log('📊 Blackbox Auth Test Reports generated:');
    console.log(`   HTML: ${reports.html}`);
    console.log(`   JSON: ${reports.json}`);
    console.log(`   CSV: ${reports.csv}`);
  });

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
      
      // Capture screenshot
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
        category: 'Authentication & Authorization',
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
        category: 'Authentication & Authorization',
        timestamp: new Date()
      };
    }

    results.push(result);
    reporter.addResult(result);

    // Log result
    const statusEmoji = result.status === 'Berhasil' ? '✅' : '❌';
    console.log(`${statusEmoji} [${testId}] ${testCase}: ${result.status}`);
    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }
  };

  test('BB-AUTH-001: Login dengan email dan password valid', async () => {
    await executeTest(
      'BB-AUTH-001',
      'Login dengan kredensial valid',
      'User login dengan email dan password yang benar',
      'User berhasil login, redirect ke dashboard, session aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        // Fill login form
        await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
        await page.type('[name="password"]', TestConfig.testUsers.regularUser.password);
        
        // Submit form
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.click('[type="submit"]')
        ]);
        
        // Check if redirected to dashboard
        const currentUrl = page.url();
        const isDashboard = currentUrl.includes('/dashboard') || currentUrl === `${TestConfig.baseUrl}/`;
        
        // Check for user elements indicating successful login
        const userIndicator = await page.$('[data-testid="user-menu"], .user-profile, [aria-label*="user"]') !== null;
        
        if (isDashboard && userIndicator) {
          return {
            actualResult: 'User berhasil login dan diarahkan ke dashboard dengan session aktif',
            success: true
          };
        } else {
          return {
            actualResult: `Login gagal - URL: ${currentUrl}, User indicator: ${userIndicator}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-002: Login dengan email valid, password salah', async () => {
    await executeTest(
      'BB-AUTH-002',
      'Login dengan password salah',
      'User login dengan email benar tapi password salah',
      'Error "Invalid credentials", tetap di halaman login',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
        await page.type('[name="password"]', 'wrongpassword123');
        
        await page.click('[type="submit"]');
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {}); // Wait for error message
        
        // Check for error message
        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');
        
        // Verify still on login page
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('/login');
        
        if (errorMessage && errorMessage.toLowerCase().includes('invalid') && isLoginPage) {
          return {
            actualResult: `Error ditampilkan: "${errorMessage}", tetap di halaman login`,
            success: true
          };
        } else {
          return {
            actualResult: `Error tidak sesuai atau redirect tidak tepat - Error: "${errorMessage}", URL: ${currentUrl}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-003: Login dengan email tidak terdaftar', async () => {
    await executeTest(
      'BB-AUTH-003',
      'Login dengan email tidak terdaftar',
      'User login dengan email yang belum terdaftar di sistem',
      'Error "User not found", tetap di halaman login',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        await page.type('[name="email"]', 'notregistered@test.com');
        await page.type('[name="password"]', 'somepassword123');
        
        await page.click('[type="submit"]');
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
        
        const errorMessage = await page.$eval(
          '.error-message, .alert-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');
        
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('/login');
        
        const hasUserNotFoundError = errorMessage && (
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('credentials')
        );
        
        if (hasUserNotFoundError && isLoginPage) {
          return {
            actualResult: `Error user tidak ditemukan: "${errorMessage}", tetap di login`,
            success: true
          };
        } else {
          return {
            actualResult: `Error tidak sesuai - Error: "${errorMessage}", URL: ${currentUrl}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-004: Login dengan email kosong', async () => {
    await executeTest(
      'BB-AUTH-004',
      'Login dengan email kosong',
      'User mencoba login tanpa mengisi email',
      'Error "Email is required", form validation aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        // Only fill password, leave email empty
        await page.type('[name="password"]', 'somepassword123');
        
        await page.click('[type="submit"]');
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
        
        // Check for validation error
        const emailInput = await page.$('[name="email"]');
        const validationMessage = await page.evaluate((input) => {
          return (input as HTMLInputElement)?.validationMessage || '';
        }, emailInput);
        
        // Check for custom error messages
        const errorMessage = await page.$eval(
          '.error-message, .field-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');
        
        const hasEmailRequiredError = (validationMessage && validationMessage.toLowerCase().includes('required')) ||
                                    (errorMessage && errorMessage.toLowerCase().includes('required')) ||
                                    (errorMessage && errorMessage.toLowerCase().includes('email'));
        
        if (hasEmailRequiredError) {
          return {
            actualResult: `Validasi email required aktif: "${validationMessage || errorMessage}"`,
            success: true
          };
        } else {
          return {
            actualResult: `Validasi tidak berfungsi - Validation: "${validationMessage}", Error: "${errorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-005: Login dengan password kosong', async () => {
    await executeTest(
      'BB-AUTH-005',
      'Login dengan password kosong',
      'User mencoba login tanpa mengisi password',
      'Error "Password is required", form validation aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        // Only fill email, leave password empty
        await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
        
        await page.click('[type="submit"]');
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
        
        const passwordInput = await page.$('[name="password"]');
        const validationMessage = await page.evaluate((input) => {
          return (input as HTMLInputElement)?.validationMessage || '';
        }, passwordInput);
        
        const errorMessage = await page.$eval(
          '.error-message, .field-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');
        
        const hasPasswordRequiredError = (validationMessage && validationMessage.toLowerCase().includes('required')) ||
                                       (errorMessage && errorMessage.toLowerCase().includes('required')) ||
                                       (errorMessage && errorMessage.toLowerCase().includes('password'));
        
        if (hasPasswordRequiredError) {
          return {
            actualResult: `Validasi password required aktif: "${validationMessage || errorMessage}"`,
            success: true
          };
        } else {
          return {
            actualResult: `Validasi tidak berfungsi - Validation: "${validationMessage}", Error: "${errorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-006: Login dengan format email invalid', async () => {
    await executeTest(
      'BB-AUTH-006',
      'Login dengan format email invalid',
      'User login dengan format email yang tidak valid',
      'Error "Invalid email format", form validation aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        await page.type('[name="email"]', 'invalid-email-format');
        await page.type('[name="password"]', 'somepassword123');
        
        await page.click('[type="submit"]');
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
        
        const emailInput = await page.$('[name="email"]');
        const validationMessage = await page.evaluate((input) => {
          return (input as HTMLInputElement)?.validationMessage || '';
        }, emailInput);
        
        const errorMessage = await page.$eval(
          '.error-message, .field-error, [role="alert"], .text-red-500',
          el => el.textContent
        ).catch(() => '');
        
        const hasEmailFormatError = (validationMessage && (
          validationMessage.toLowerCase().includes('email') ||
          validationMessage.toLowerCase().includes('valid')
        )) || (errorMessage && (
          errorMessage.toLowerCase().includes('email') ||
          errorMessage.toLowerCase().includes('format')
        ));
        
        if (hasEmailFormatError) {
          return {
            actualResult: `Validasi format email aktif: "${validationMessage || errorMessage}"`,
            success: true
          };
        } else {
          return {
            actualResult: `Validasi format email tidak berfungsi - Validation: "${validationMessage}", Error: "${errorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-007: Multiple failed login attempts', async () => {
    await executeTest(
      'BB-AUTH-007',
      'Multiple failed login attempts',
      'User melakukan percobaan login gagal sebanyak >5 kali',
      'Account lockout atau rate limiting aktif',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        const maxAttempts = TestConfig.security.maxLoginAttempts + 1;
        let lastErrorMessage = '';
        
        // Perform multiple failed login attempts
        for (let i = 0; i < maxAttempts; i++) {
          await page.evaluate(() => {
            const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
            const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
          });
          
          await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
          await page.type('[name="password"]', `wrongpassword${i}`);
          
          await page.click('[type="submit"]');
          await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
          
          lastErrorMessage = await page.$eval(
            '.error-message, .alert-error, [role="alert"], .text-red-500',
            el => el?.textContent || ''
          ).catch(() => '');
        }
        
        // Check if account is locked or rate limited
        const isAccountLocked = lastErrorMessage && (
          lastErrorMessage.toLowerCase().includes('locked') ||
          lastErrorMessage.toLowerCase().includes('blocked') ||
          lastErrorMessage.toLowerCase().includes('limit') ||
          lastErrorMessage.toLowerCase().includes('attempts')
        );
        
        // Check if submit button is disabled
        const submitButton = await page.$('[type="submit"]');
        const isButtonDisabled = await page.evaluate((btn) => {
          return (btn as HTMLButtonElement)?.disabled || false;
        }, submitButton);
        
        if (isAccountLocked || isButtonDisabled) {
          return {
            actualResult: `Rate limiting aktif - Error: "${lastErrorMessage}", Button disabled: ${isButtonDisabled}`,
            success: true
          };
        } else {
          return {
            actualResult: `Rate limiting tidak aktif - Error: "${lastErrorMessage}"`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-008: Registrasi dengan data valid', async () => {
    await executeTest(
      'BB-AUTH-008',
      'Registrasi user baru',
      'User mendaftar dengan data lengkap dan valid',
      'User baru terbuat, redirect ke login',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/register`);
        
        const timestamp = Date.now();
        const testEmail = `newuser${timestamp}@test.com`;
        
        await page.type('[name="name"]', 'New Test User');
        await page.type('[name="email"]', testEmail);
        await page.type('[name="password"]', 'NewUserPass123!');
        
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
          page.click('[type="submit"]')
        ]);
        
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('/login');
        
        // Check for success message
        const successMessage = await page.$eval(
          '.success-message, .alert-success, .text-green-500',
          el => el.textContent
        ).catch(() => '');
        
        if (isLoginPage || successMessage) {
          return {
            actualResult: `User berhasil dibuat - URL: ${currentUrl}, Success: "${successMessage}"`,
            success: true
          };
        } else {
          return {
            actualResult: `Registrasi gagal - URL: ${currentUrl}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-009: Akses halaman protected tanpa login', async () => {
    await executeTest(
      'BB-AUTH-009',
      'Akses halaman protected tanpa login',
      'User mengakses halaman yang memerlukan autentikasi tanpa login',
      'Redirect ke halaman login dengan return URL',
      async () => {
        // Try to access protected pages
        const protectedPages = ['/dashboard', '/users', '/attendance', '/register'];
        const results = [];
        
        for (const pagePath of protectedPages) {
          await page.goto(`${TestConfig.baseUrl}${pagePath}`);
          await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
          
          const currentUrl = page.url();
          const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');
          
          results.push({
            page: pagePath,
            redirected: isRedirectedToLogin,
            currentUrl
          });
        }
        
        const allRedirected = results.every(r => r.redirected);
        
        if (allRedirected) {
          return {
            actualResult: `Semua halaman protected redirect ke login: ${results.map(r => `${r.page}→${r.currentUrl}`).join(', ')}`,
            success: true
          };
        } else {
          const unprotected = results.filter(r => !r.redirected);
          return {
            actualResult: `Halaman tidak ter-protect: ${unprotected.map(r => r.page).join(', ')}`,
            success: false
          };
        }
      }
    );
  });

  test('BB-AUTH-010: Session timeout test', async () => {
    await executeTest(
      'BB-AUTH-010',
      'Session timeout test',
      'Test behavior ketika session user timeout',
      'Auto logout setelah inaktif, redirect ke login',
      async () => {
        // Login first
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
        await page.type('[name="password"]', TestConfig.testUsers.regularUser.password);
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.click('[type="submit"]')
        ]);
        
        // Mock session expiration by manipulating localStorage/cookies
        await page.evaluate(() => {
          // Clear session storage
          sessionStorage.clear();
          localStorage.clear();
          
          // Expire cookies
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        });
        
        // Try to access protected page
        await page.goto(`${TestConfig.baseUrl}/dashboard`);
        await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
        
        const currentUrl = page.url();
        const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');
        
        if (isRedirectedToLogin) {
          return {
            actualResult: `Session timeout berhasil, redirect ke login: ${currentUrl}`,
            success: true
          };
        } else {
          return {
            actualResult: `Session tidak expired atau redirect gagal: ${currentUrl}`,
            success: false
          };
        }
      }
    );
  });

  // Additional tests can be added here...
  // We'll continue with the remaining authentication tests in subsequent test files
});