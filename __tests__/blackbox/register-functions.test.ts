/**
 * Blackbox Testing - Registration Page Functions
 * Testing registration functionality from user perspective (Input → Output)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import fetch from 'node-fetch';
import TestReporter, { TestResult } from '../utils/testReporter';
import TestConfig from '../utils/testConfig';

describe('Blackbox Testing - Registration Page Functions', () => {
  let reporter: TestReporter;
  const results: TestResult[] = [];

  beforeAll(async () => {
    reporter = new TestReporter();
    console.log('📝 Starting Registration Functions Blackbox Testing');
  });

  afterAll(async () => {
    const reports = reporter.generateAllReports('register-functions-blackbox');
    console.log('📊 Registration Functions Test Reports:');
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
        category: 'Registration Functions',
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
        category: 'Registration Functions',
        timestamp: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      results.push(testResult);
      reporter.addResult(testResult);
      console.log(`❌ [${testId}] ${testCase}: Error - ${error}`);
    }
  };

  test('REG-01: Registration Function - Valid Data', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'John Doe',
      email: `newuser${timestamp}@test.com`,
      password: 'NewUser123!'
    };

    const expectedOutput = {
      success: true,
      userCreated: true,
      redirectUrl: '/login'
    };

    await executeTest(
      'REG-01',
      'Valid Registration Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          userCreated: !!(data.user || data.userId),
          redirectUrl: data.redirectUrl || (response.ok ? '/login' : null)
        };

        const success = actualOutput.success &&
                        actualOutput.userCreated &&
                        actualOutput.redirectUrl === expectedOutput.redirectUrl;

        return { actualOutput, success };
      }
    );
  });

  test('REG-02: Duplicate Email Validation Function - Existing Email', async () => {
    // First create a user
    const timestamp = Date.now();
    const existingEmail = `existing${timestamp}@test.com`;
    
    await fetch(`${TestConfig.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First User',
        email: existingEmail,
        password: 'FirstUser123!'
      })
    });

    const input = {
      name: 'Second User',
      email: existingEmail,
      password: 'SecondUser123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Email already exists',
      validationError: true
    };

    await executeTest(
      'REG-02',
      'Duplicate Email Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400 || response.status === 409
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('exists') ||
                         actualOutput.errorMessage.toLowerCase().includes('taken') ||
                         actualOutput.errorMessage.toLowerCase().includes('already'));

        return { actualOutput, success };
      }
    );
  });

  test('REG-03: Password Validation Function - Weak Password', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'Test User',
      email: `weakpass${timestamp}@test.com`,
      password: '123'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Password too weak',
      validationError: true
    };

    await executeTest(
      'REG-03',
      'Weak Password Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('password') ||
                         actualOutput.errorMessage.toLowerCase().includes('weak') ||
                         actualOutput.errorMessage.toLowerCase().includes('requirements'));

        return { actualOutput, success };
      }
    );
  });

  test('REG-04: Email Format Validation Function - Invalid Email', async () => {
    const input = {
      name: 'Test User',
      email: 'invalid-email-format',
      password: 'ValidPass123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Invalid email format',
      validationError: true
    };

    await executeTest(
      'REG-04',
      'Email Format Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('email') &&
                         (actualOutput.errorMessage.toLowerCase().includes('invalid') ||
                          actualOutput.errorMessage.toLowerCase().includes('format')));

        return { actualOutput, success };
      }
    );
  });

  test('REG-05: Required Fields Validation Function - Empty Name', async () => {
    const timestamp = Date.now();
    const input = {
      name: '',
      email: `noname${timestamp}@test.com`,
      password: 'ValidPass123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Name is required',
      validationError: true
    };

    await executeTest(
      'REG-05',
      'Empty Name Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('name') &&
                         actualOutput.errorMessage.toLowerCase().includes('required'));

        return { actualOutput, success };
      }
    );
  });

  test('REG-06: Required Fields Validation Function - Empty Email', async () => {
    const input = {
      name: 'Test User',
      email: '',
      password: 'ValidPass123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Email is required',
      validationError: true
    };

    await executeTest(
      'REG-06',
      'Empty Email Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
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

  test('REG-07: Required Fields Validation Function - Empty Password', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'Test User',
      email: `nopass${timestamp}@test.com`,
      password: ''
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Password is required',
      validationError: true
    };

    await executeTest(
      'REG-07',
      'Empty Password Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
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

  test('REG-08: Name Validation Function - Invalid Characters', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'Test<script>alert("xss")</script>User',
      email: `specialname${timestamp}@test.com`,
      password: 'ValidPass123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Invalid characters in name',
      validationError: true
    };

    await executeTest(
      'REG-08',
      'Name Special Characters Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        // Success if either rejected due to validation OR accepted but sanitized
        const success = (!actualOutput.success && actualOutput.validationError) ||
                        (actualOutput.success && data.user && 
                         !data.user.name.includes('<script>'));

        return { actualOutput, success };
      }
    );
  });

  test('REG-09: Password Complexity Function - No Uppercase', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'Test User',
      email: `nouppercase${timestamp}@test.com`,
      password: 'lowercase123!'
    };

    const expectedOutput = {
      success: false,
      errorMessage: 'Password must contain uppercase',
      validationError: true
    };

    await executeTest(
      'REG-09',
      'Password Uppercase Validation Function',
      input,
      expectedOutput,
      async () => {
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        const actualOutput = {
          success: response.ok && data.success,
          errorMessage: data.error || data.message,
          validationError: response.status === 400
        };

        const success = !actualOutput.success &&
                        actualOutput.validationError &&
                        actualOutput.errorMessage &&
                        (actualOutput.errorMessage.toLowerCase().includes('password') &&
                         (actualOutput.errorMessage.toLowerCase().includes('uppercase') ||
                          actualOutput.errorMessage.toLowerCase().includes('requirements')));

        return { actualOutput, success };
      }
    );
  });

  test('REG-10: User Creation Function - Complete Registration Flow', async () => {
    const timestamp = Date.now();
    const input = {
      name: 'Complete User',
      email: `complete${timestamp}@test.com`,
      password: 'CompletePass123!'
    };

    const expectedOutput = {
      success: true,
      userCreated: true,
      hasUserId: true,
      defaultRole: 'USER',
      canLogin: true
    };

    await executeTest(
      'REG-10',
      'Complete User Creation Function',
      input,
      expectedOutput,
      async () => {
        // Register user
        const response = await fetch(`${TestConfig.apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        const data = await response.json() as any;
        
        // Try to login with newly created user
        const loginResponse = await fetch(`${TestConfig.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: input.email,
            password: input.password
          })
        });

        const loginData = await loginResponse.json() as any;

        const actualOutput = {
          success: response.ok && data.success,
          userCreated: !!(data.user || data.userId),
          hasUserId: !!(data.user?.id || data.userId),
          defaultRole: data.user?.role || 'USER',
          canLogin: loginResponse.ok && loginData.success
        };

        const success = actualOutput.success &&
                        actualOutput.userCreated &&
                        actualOutput.hasUserId &&
                        actualOutput.defaultRole === expectedOutput.defaultRole &&
                        actualOutput.canLogin;

        return { actualOutput, success };
      }
    );
  });
});