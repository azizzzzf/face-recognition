/**
 * Security Testing - Authentication & Authorization
 * Tests for security vulnerabilities and attack vectors
 */

import { describe, test, beforeEach, afterAll } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';
import path from 'path';

describe('Security Testing - Authentication & Authorization', () => {
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
    
    const reports = reporter.generateAllReports('security-auth-results');
    console.log('🛡️ Security Auth Test Reports generated:');
    console.log(`   HTML: ${reports.html}`);
    console.log(`   JSON: ${reports.json}`);
    console.log(`   CSV: ${reports.csv}`);
  });

  const executeSecurityTest = async (
    testId: string,
    testCase: string,
    description: string,
    expectedResult: string,
    testFunction: () => Promise<{ actualResult: string; success: boolean; error?: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>
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
        actualResult: testResult.actualResult + (testResult.severity ? ` [${testResult.severity}]` : ''),
        status: testResult.success ? 'Berhasil' : 'Tidak Berhasil',
        executionTime,
        screenshot: screenshotPath,
        errorMessage: testResult.error,
        category: 'Security - Authentication',
        timestamp: new Date()
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      result = {
        id: testId,
        testCase,
        description,
        expectedResult,
        actualResult: `Security test failed: ${error}`,
        status: 'Tidak Berhasil',
        executionTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        category: 'Security - Authentication',
        timestamp: new Date()
      };
    }

    results.push(result);
    reporter.addResult(result);

    const statusEmoji = result.status === 'Berhasil' ? '✅' : '🚨';
    console.log(`${statusEmoji} [${testId}] ${testCase}: ${result.status}`);
    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }
  };

  test('SEC-AUTH-156: SQL Injection di login form', async () => {
    await executeSecurityTest(
      'SEC-AUTH-156',
      'SQL Injection Prevention',
      'Mencoba SQL injection attack pada login form',
      'Input disanitasi, injection gagal, no database error exposed',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        const sqlInjectionPayloads = [
          "admin' OR '1'='1",
          "admin'; DROP TABLE users; --",
          "admin' UNION SELECT * FROM users --",
          "' OR 1=1 --",
          "admin' OR 'x'='x",
          "1' OR '1'='1' /*",
          "admin'; UPDATE users SET password='hacked' WHERE id=1; --"
        ];

        let vulnerabilityFound = false;
        let suspiciousResponse = '';

        for (const payload of sqlInjectionPayloads) {
          // Clear previous values
          await page.evaluate(() => {
            const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
            const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
          });

          await page.type('[name="email"]', payload);
          await page.type('[name="password"]', payload);
          
          await page.click('[type="submit"]');
          await page.waitForTimeout(2000);

          // Check for successful login (vulnerability)
          const currentUrl = page.url();
          const isDashboard = currentUrl.includes('/dashboard') || currentUrl === `${TestConfig.baseUrl}/`;
          
          // Check for database error messages
          const bodyText = await page.evaluate(() => document.body.textContent || '');
          const hasDatabaseError = /sql|database|mysql|postgres|sqlite|oracle|syntax error/i.test(bodyText);
          
          if (isDashboard) {
            vulnerabilityFound = true;
            suspiciousResponse = `SQL injection successful with payload: ${payload}`;
            break;
          }
          
          if (hasDatabaseError) {
            vulnerabilityFound = true;
            suspiciousResponse = `Database error exposed: ${bodyText.substring(0, 200)}`;
            break;
          }
        }

        if (!vulnerabilityFound) {
          return {
            actualResult: 'SQL injection attempts blocked, no database errors exposed',
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: suspiciousResponse,
            success: false,
            severity: 'CRITICAL'
          };
        }
      }
    );
  });

  test('SEC-AUTH-157: XSS Prevention in Login Form', async () => {
    await executeSecurityTest(
      'SEC-AUTH-157',
      'XSS Attack Prevention',
      'Mencoba XSS attack pada form login',
      'Script tidak dieksekusi, output di-escape dengan benar',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '<img src="x" onerror="alert(\'XSS\')">',
          'javascript:alert("XSS")',
          '<svg onload="alert(\'XSS\')">',
          '<iframe src="javascript:alert(\'XSS\')">',
          '"><script>alert("XSS")</script>',
          '\'; alert(\'XSS\'); //',
          '<body onload="alert(\'XSS\')">'
        ];

        let xssExecuted = false;
        let alertDetected = false;

        // Setup dialog listener to catch alert boxes
        page.on('dialog', async (dialog) => {
          alertDetected = true;
          await dialog.dismiss();
        });

        for (const payload of xssPayloads) {
          await page.evaluate(() => {
            const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
            const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
          });

          await page.type('[name="email"]', payload);
          await page.type('[name="password"]', 'testpass');
          
          await page.click('[type="submit"]');
          await page.waitForTimeout(2000);

          // Check if XSS payload is rendered as-is (vulnerability)
          const pageContent = await page.content();
          const hasUnescapedScript = pageContent.includes('<script>') && pageContent.includes(payload);
          
          if (hasUnescapedScript || alertDetected) {
            xssExecuted = true;
            break;
          }
        }

        if (!xssExecuted && !alertDetected) {
          return {
            actualResult: 'XSS attempts blocked, scripts properly escaped',
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `XSS vulnerability detected - Alert triggered: ${alertDetected}`,
            success: false,
            severity: 'HIGH'
          };
        }
      }
    );
  });

  test('SEC-AUTH-158: CSRF Protection', async () => {
    await executeSecurityTest(
      'SEC-AUTH-158',
      'CSRF Token Validation',
      'Test CSRF protection pada form authentication',
      'Request tanpa valid CSRF token ditolak',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        // Get login form action and extract CSRF token if present
        const formData = await page.evaluate(() => {
          const form = document.querySelector('form');
          if (!form) return null;
          
          const csrfInput = form.querySelector('input[name*="csrf"], input[name*="token"], input[type="hidden"]') as HTMLInputElement;
          return {
            action: form.action || window.location.href,
            csrfToken: csrfInput?.value || null,
            csrfName: csrfInput?.name || null
          };
        });

        if (!formData) {
          return {
            actualResult: 'No form found for CSRF testing',
            success: false,
            severity: 'MEDIUM'
          };
        }

        // Try to submit form with invalid/missing CSRF token
        const response = await page.evaluate(async (data) => {
          const formData = new FormData();
          formData.append('email', 'test@example.com');
          formData.append('password', 'testpass');
          
          // Add invalid CSRF token
          if (data.csrfName) {
            formData.append(data.csrfName, 'invalid_csrf_token_12345');
          }

          try {
            const response = await fetch(data.action, {
              method: 'POST',
              body: formData,
              credentials: 'same-origin'
            });
            
            return {
              status: response.status,
              statusText: response.statusText,
              text: await response.text()
            };
          } catch (error) {
            return {
              error: error.toString()
            };
          }
        }, formData);

        // Check if request was rejected
        const isRejected = response.status === 403 || response.status === 400 || 
                          response.text?.includes('CSRF') || response.text?.includes('token');

        if (isRejected) {
          return {
            actualResult: `CSRF protection active - Request rejected with status ${response.status}`,
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `CSRF protection missing - Request accepted with status ${response.status}`,
            success: false,
            severity: 'HIGH'
          };
        }
      }
    );
  });

  test('SEC-AUTH-159: Brute Force Protection', async () => {
    await executeSecurityTest(
      'SEC-AUTH-159',
      'Brute Force Attack Protection',
      'Test protection against brute force login attempts',
      'Account lockout atau rate limiting setelah threshold attempts',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        const maxAttempts = TestConfig.security.maxLoginAttempts + 2;
        let lockedOut = false;
        let rateLimited = false;
        let lastResponse = '';

        const startTime = Date.now();

        for (let i = 0; i < maxAttempts; i++) {
          await page.evaluate(() => {
            const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
            const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
          });

          await page.type('[name="email"]', 'victim@example.com');
          await page.type('[name="password"]', `wrongpass${i}`);
          
          const attemptStart = Date.now();
          await page.click('[type="submit"]');
          await page.waitForTimeout(1000);
          const attemptEnd = Date.now();

          // Check for lockout message
          const errorMessage = await page.$eval(
            '.error-message, .alert-error, [role="alert"], .text-red-500',
            el => el.textContent
          ).catch(() => '');

          // Check if response time increased (potential rate limiting)
          const responseTime = attemptEnd - attemptStart;
          if (responseTime > 3000) {
            rateLimited = true;
          }

          // Check for lockout indicators
          if (errorMessage.toLowerCase().includes('locked') ||
              errorMessage.toLowerCase().includes('blocked') ||
              errorMessage.toLowerCase().includes('attempts') ||
              errorMessage.toLowerCase().includes('limit')) {
            lockedOut = true;
            lastResponse = errorMessage;
            break;
          }

          lastResponse = errorMessage;
        }

        const totalTime = Date.now() - startTime;
        const avgTime = totalTime / maxAttempts;

        if (lockedOut || rateLimited || avgTime > 2000) {
          return {
            actualResult: `Brute force protection active - Locked: ${lockedOut}, Rate limited: ${rateLimited}, Avg time: ${avgTime}ms`,
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `No brute force protection detected - ${maxAttempts} attempts in ${totalTime}ms`,
            success: false,
            severity: 'HIGH'
          };
        }
      }
    );
  });

  test('SEC-AUTH-160: Session Security', async () => {
    await executeSecurityTest(
      'SEC-AUTH-160',
      'Session Token Security',
      'Test keamanan session token dan cookie attributes',
      'Session cookies secure, HttpOnly, SameSite attributes set',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
        
        // Login to get session
        await page.type('[name="email"]', TestConfig.testUsers.regularUser.email);
        await page.type('[name="password"]', TestConfig.testUsers.regularUser.password);
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.click('[type="submit"]')
        ]);

        // Get all cookies
        const cookies = await page.cookies();
        
        // Check session cookie security attributes
        const sessionCookie = cookies.find(c => 
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('auth') ||
          c.name.toLowerCase().includes('token') ||
          c.name.toLowerCase().includes('jwt')
        );

        if (!sessionCookie) {
          return {
            actualResult: 'No session cookie found',
            success: false,
            severity: 'MEDIUM'
          };
        }

        const securityIssues = [];
        
        // Check Secure flag
        if (!sessionCookie.secure && page.url().startsWith('https://')) {
          securityIssues.push('Missing Secure flag');
        }
        
        // Check HttpOnly flag
        if (!sessionCookie.httpOnly) {
          securityIssues.push('Missing HttpOnly flag');
        }
        
        // Check SameSite attribute
        if (!sessionCookie.sameSite || sessionCookie.sameSite === 'None') {
          securityIssues.push('Weak SameSite attribute');
        }

        // Test session token randomness
        const tokenEntropy = calculateEntropy(sessionCookie.value);
        if (tokenEntropy < 3.5) { // Low entropy indicates predictable tokens
          securityIssues.push(`Low session token entropy: ${tokenEntropy}`);
        }

        if (securityIssues.length === 0) {
          return {
            actualResult: `Session cookie secure - Name: ${sessionCookie.name}, Secure: ${sessionCookie.secure}, HttpOnly: ${sessionCookie.httpOnly}, SameSite: ${sessionCookie.sameSite}`,
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `Session security issues: ${securityIssues.join(', ')}`,
            success: false,
            severity: 'MEDIUM'
          };
        }
      }
    );
  });

  test('SEC-AUTH-161: Password Policy Bypass', async () => {
    await executeSecurityTest(
      'SEC-AUTH-161',
      'Password Policy Enforcement',
      'Mencoba bypass password policy requirements',
      'Weak passwords ditolak meski ada bypass attempts',
      async () => {
        await page.goto(`${TestConfig.baseUrl}/auth/register`);
        
        const bypassAttempts = [
          { name: 'Short password', password: '123' },
          { name: 'Common password', password: 'password123' },
          { name: 'No uppercase', password: 'lowercase123!' },
          { name: 'No lowercase', password: 'UPPERCASE123!' },
          { name: 'No numbers', password: 'NoNumbersHere!' },
          { name: 'Spaces only', password: '        ' },
          { name: 'Special chars bypass', password: 'pass\u0000word' }, // null byte
          { name: 'Unicode bypass', password: 'pаssword123' }, // Cyrillic 'a'
        ];

        let bypassSuccessful = false;
        const failedAttempts = [];

        for (const attempt of bypassAttempts) {
          await page.evaluate(() => {
            const inputs = ['name', 'email', 'password'];
            inputs.forEach(inputName => {
              const input = document.querySelector(`[name="${inputName}"]`) as HTMLInputElement;
              if (input) input.value = '';
            });
          });

          await page.type('[name="name"]', 'Test User');
          await page.type('[name="email"]', `test${Date.now()}@example.com`);
          await page.type('[name="password"]', attempt.password);
          
          await page.click('[type="submit"]');
          await page.waitForTimeout(2000);

          // Check if registration was successful (bypass)
          const currentUrl = page.url();
          const isSuccessful = !currentUrl.includes('register') || 
                             await page.$('.success-message, .alert-success') !== null;
          
          // Check for password error
          const errorMessage = await page.$eval(
            '.error-message, .alert-error, .text-red-500',
            el => el.textContent
          ).catch(() => '');

          const hasPasswordError = errorMessage.toLowerCase().includes('password') ||
                                 errorMessage.toLowerCase().includes('weak') ||
                                 errorMessage.toLowerCase().includes('requirements');

          if (isSuccessful && !hasPasswordError) {
            bypassSuccessful = true;
            failedAttempts.push(attempt.name);
          }
        }

        if (!bypassSuccessful) {
          return {
            actualResult: 'Password policy enforced correctly, all weak passwords rejected',
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `Password policy bypassed with: ${failedAttempts.join(', ')}`,
            success: false,
            severity: 'MEDIUM'
          };
        }
      }
    );
  });

  test('SEC-AUTH-162: Authentication Bypass', async () => {
    await executeSecurityTest(
      'SEC-AUTH-162',
      'Authentication Bypass Attempts',
      'Mencoba bypass authentication dengan berbagai teknik',
      'Semua bypass attempts gagal, authentication tetap required',
      async () => {
        const protectedEndpoints = [
          '/dashboard',
          '/users',
          '/admin',
          '/api/users',
          '/api/attendance'
        ];

        const bypassTechniques = [
          // Direct URL manipulation
          async (endpoint: string) => {
            await page.goto(`${TestConfig.baseUrl}${endpoint}`);
            return { technique: 'Direct URL access', url: page.url() };
          },
          
          // Session manipulation
          async (endpoint: string) => {
            await page.evaluate(() => {
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }));
              document.cookie = 'session=fake_session_token; path=/';
            });
            await page.goto(`${TestConfig.baseUrl}${endpoint}`);
            return { technique: 'Local storage manipulation', url: page.url() };
          },
          
          // Header manipulation
          async (endpoint: string) => {
            await page.setExtraHTTPHeaders({
              'X-User-ID': '1',
              'X-User-Role': 'admin',
              'Authorization': 'Bearer fake_token',
              'X-Forwarded-User': 'admin@test.com'
            });
            await page.goto(`${TestConfig.baseUrl}${endpoint}`);
            return { technique: 'Header manipulation', url: page.url() };
          }
        ];

        const successfulBypasses = [];

        for (const endpoint of protectedEndpoints) {
          for (const technique of bypassTechniques) {
            try {
              // Clear any existing session
              await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
                document.cookie.split(";").forEach(c => {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
              });

              const result = await technique(endpoint);
              await page.waitForTimeout(2000);
              
              const finalUrl = page.url();
              const isProtected = finalUrl.includes('/login') || finalUrl.includes('/auth');
              
              if (!isProtected && finalUrl.includes(endpoint.replace('/api/', ''))) {
                successfulBypasses.push(`${result.technique} on ${endpoint}`);
              }
              
            } catch (error) {
              // Errors are expected for protected endpoints
            }
          }
        }

        if (successfulBypasses.length === 0) {
          return {
            actualResult: 'All authentication bypass attempts failed - security intact',
            success: true,
            severity: 'LOW'
          };
        } else {
          return {
            actualResult: `Authentication bypassed: ${successfulBypasses.join(', ')}`,
            success: false,
            severity: 'CRITICAL'
          };
        }
      }
    );
  });

  // Helper function to calculate entropy
  function calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = str.length;
    for (const count of Object.values(freq)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }
});