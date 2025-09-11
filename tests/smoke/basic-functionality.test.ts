import { describe, test, expect } from '@jest/globals';

describe('Smoke Tests - Basic Functionality', () => {
  test('Environment is configured', () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(typeof process.env.NODE_ENV).toBe('string');
  });

  test('Basic Node.js functionality works', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
    expect(typeof result).toBe('number');
  });

  test('JSON processing works', () => {
    const testObj = { name: 'test', version: '1.0.0' };
    const json = JSON.stringify(testObj);
    const parsed = JSON.parse(json);
    
    expect(parsed.name).toBe('test');
    expect(parsed.version).toBe('1.0.0');
  });

  test('Promise handling works', async () => {
    const testPromise = new Promise(resolve => {
      setTimeout(() => resolve('success'), 10);
    });

    const result = await testPromise;
    expect(result).toBe('success');
  });

  test('Module imports work correctly', () => {
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });
});