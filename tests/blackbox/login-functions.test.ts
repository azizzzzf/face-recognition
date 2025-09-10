/**
 * Blackbox Testing - Login Page Functions
 * Testing login functionality from user perspective (Input → Output)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
const fetch = require('node-fetch');
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';

describe('Blackbox Testing - Login Page Functions', () => {
  let reporter: TestReporter;
  const results: TestResult[] = [];

  beforeAll(async () => {
    reporter = new TestReporter();
    console.log('🔐 Starting Login Functions Blackbox Testing');
  });

  afterAll(async () => {
    const reports = reporter.generateAllReports('login-functions-blackbox');
    console.log('📊 Login Functions Test Reports:');
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
        description: `Input: ${JSON.stringify(input)}`,
        expectedResult: `Output: ${JSON.stringify(expectedOutput)}`,
        actualResult: `Output: ${JSON.stringify(result.actualOutput)}`,
        status: result.success ? 'Berhasil' : 'Tidak Berhasil',
        executionTime,
        category: 'Login Functions',
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
        description: `Input: ${JSON.stringify(input)}`,
        expectedResult: `Output: ${JSON.stringify(expectedOutput)}`,
        actualResult: `Error: ${error}`,
        status: 'Tidak Berhasil',
        executionTime,
        category: 'Login Functions',
        timestamp: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      results.push(testResult);
      reporter.addResult(testResult);
      console.log(`❌ [${testId}] ${testCase}: Error - ${error}`);
    }
  };

  test('LOGIN-01: Login Function - Valid Credentials', async () => {
    const input = {
      email: 'user@test.com',
      password: 'UserPass123!'
    };

    const expectedOutput = {
      success: true,
      redirectUrl: '/dashboard',
      hasSession: true
    };

    await executeTest(
      'LOGIN-01',
      'Valid Login Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          redirectUrl: data.redirectUrl || (response.ok ? '/dashboard' : null),
          hasSession: !!(data.session || data.token || data.user)
        };

        const success = actualOutput.success && 
                        actualOutput.redirectUrl === expectedOutput.redirectUrl &&
                        actualOutput.hasSession === expectedOutput.hasSession;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-02: Login Function - Invalid Password', async () => {
    const input = {
      email: 'user@test.com',
      password: 'wrongPassword123'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Invalid credentials',
      stayOnPage: true
    };

    await executeTest(
      'LOGIN-02',
      'Invalid Password Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          stayOnPage: !response.ok || !data.success
        };

        const success = !actualOutput.success &&
                        actualOutput.errorMessage &&
                        actualOutput.errorMessage.toLowerCase().includes('invalid') &&
                        actualOutput.stayOnPage;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-03: Login Function - Non-existent Email', async () => {
    const input = {
      email: 'nonexistent@test.com',
      password: 'somePassword123'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'User not found',
      stayOnPage: true
    };

    await executeTest(
      'LOGIN-03',
      'Non-existent Email Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          stayOnPage: !response.ok || !data.success
        };

        const success = !actualOutput.success &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('not found') ||
                         actualOutput.errorMessage.toLowerCase().includes('invalid')) &&
                        actualOutput.stayOnPage;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-04: Email Validation Function - Invalid Format', async () => {
    const input = {
      email: 'invalid-email-format',
      password: 'somePassword123'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Invalid email format',
      validationError: true
    };

    await executeTest(
      'LOGIN-04',
      'Email Format Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        actualOutput.errorMessage.toLowerCase().includes('email');

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-05: Required Fields Validation Function - Empty Email', async () => {
    const input = {
      email: '',
      password: 'somePassword123'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Email is required',
      validationError: true
    };

    await executeTest(
      'LOGIN-05',
      'Empty Email Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('email') &&
                         actualOutput.errorMessage.toLowerCase().includes('required'));

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-06: Required Fields Validation Function - Empty Password', async () => {
    const input = {
      email: 'user@test.com',
      password: ''
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Password is required',
      validationError: true
    };

    await executeTest(
      'LOGIN-06',
      'Empty Password Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('password') &&
                         actualOutput.errorMessage.toLowerCase().includes('required'));

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-07: Rate Limiting Function - Multiple Failed Attempts', async () => {
    const input = {
      email: 'victim@test.com',
      password: 'wrongPassword'
    };

    const expectedOutput = {
      success: false,
      rateLimited: true,
      errorMessage: 'Too many attempts'
    };

    await executeTest(
      'LOGIN-07',
      'Rate Limiting Function',
      input,
      expectedOutput,
      async () => {
        // Simulate multiple failed attempts
        const attempts = 6;
        let lastResponse;
        let lastData;

        for (let i = 0; i < attempts; i++) {
          lastResponse = await fetch(`${TestConfig.apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: input.email,
              password: `${input.password}${i}`
            })
          });
          
          if (lastResponse.ok) {
            lastData = await lastResponse.json();
          } else {
            try {
              lastData = await lastResponse.json();
            } catch {
              lastData = { error: 'Request failed' };
            }
          }

          // Small delay between attempts
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const actualOutput = {
          success: lastResponse!.ok && lastData!.success,
          rateLimited: lastResponse!.status === 429 || 
                       (lastData!.error && (
                         lastData!.error.toLowerCase().includes('limit') ||
                         lastData!.error.toLowerCase().includes('attempts') ||
                         lastData!.error.toLowerCase().includes('blocked')
                       )),
          errorMessage: lastData!.error || lastData!.message
        };

        const success = !actualOutput.success && actualOutput.rateLimited;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-08: Session Creation Function - Successful Login', async () => {
    const input = {
      email: 'user@test.com',
      password: 'UserPass123!'
    };

    const expectedOutput = {
      success: true,
      hasSession: true,
      hasToken: true,
      hasUserData: true
    };

    await executeTest(
      'LOGIN-08',
      'Session Creation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json();
        
        const actualOutput = {
          success: response.ok && data.success,
          hasSession: !!(data.session || response.headers.get('set-cookie')),
          hasToken: !!(data.token || data.accessToken || data.authToken),
          hasUserData: !!(data.user || data.userData)
        };

        const success = actualOutput.success &&
                        (actualOutput.hasSession || actualOutput.hasToken) &&
                        actualOutput.hasUserData;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-09: Authentication Check Function - Valid Session', async () => {
    // First login to get session
    const loginResponse = await fetch(`${TestConfig.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'UserPass123!'
      })
    });

    const loginData = await loginResponse.json();
    const authToken = loginData.token || loginData.accessToken;
    const cookies = loginResponse.headers.get('set-cookie');

    const input = {
      authToken,
      cookies
    };

    const expectedOutput = {
      authenticated: true,
      hasUserData: true,
      validSession: true
    };

    await executeTest(
      'LOGIN-09',
      'Authentication Check Function',
      input,
      expectedOutput,
      async () => {
        const headers: any = { 'Content-Type': 'application/json' };
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        if (cookies) {
          headers['Cookie'] = cookies;
        }

        const response = await fetch(`${TestConfig.apiUrl}/auth/me`, {
          method: 'GET',
          headers
        });

        const data = await response.json();
        
        const actualOutput = {
          authenticated: response.ok && data.success,
          hasUserData: !!(data.user || data.userData),
          validSession: response.status !== 401
        };

        const success = actualOutput.authenticated &&
                        actualOutput.hasUserData &&
                        actualOutput.validSession;

        return { actualOutput, success };
      }
    );
  });

  test('LOGIN-10: Logout Function - Clear Session', async () => {
    // First login to get session
    const loginResponse = await fetch(`${TestConfig.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'UserPass123!'
      })
    });

    const loginData = await loginResponse.json();
    const authToken = loginData.token || loginData.accessToken;

    const input = {
      authToken
    };

    const expectedOutput = {
      success: true,
      sessionCleared: true,
      redirectUrl: '/login'
    };

    await executeTest(
      'LOGIN-10',
      'Logout Function',
      input,
      expectedOutput,
      async () => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${TestConfig.apiUrl}/auth/logout`, {
          method: 'POST',
          headers
        });

        const data = await response.json();

        // Test if session is cleared by trying to access protected endpoint
        const checkResponse = await fetch(`${TestConfig.apiUrl}/auth/me`, {
          method: 'GET',
          headers
        });

        const actualOutput = {
          success: response.ok && data.success,
          sessionCleared: checkResponse.status === 401,
          redirectUrl: data.redirectUrl || '/login'
        };

        const success = actualOutput.success &&
                        actualOutput.sessionCleared;

        return { actualOutput, success };
      }
    );
  });
});