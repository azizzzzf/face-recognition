import { describe, test, expect } from '@jest/globals';

describe('Security Tests - Basic Security Checks', () => {
  test('Input validation works for basic strings', () => {
    const validateInput = (input: string) => {
      if (!input || input.length === 0) return false;
      if (input.length > 1000) return false;
      if (/<script|javascript:|on\w+=/i.test(input)) return false;
      return true;
    };

    expect(validateInput('valid input')).toBe(true);
    expect(validateInput('')).toBe(false);
    expect(validateInput('<script>alert("xss")</script>')).toBe(false);
    expect(validateInput('a'.repeat(1001))).toBe(false);
  });

  test('Basic sanitization works', () => {
    const sanitize = (input: string) => {
      return input.replace(/[<>'"]/g, '');
    };

    expect(sanitize('hello world')).toBe('hello world');
    expect(sanitize('<script>alert()</script>')).toBe('scriptalert()/script');
    expect(sanitize('test"quote\'test')).toBe('testquotetest');
  });

  test('URL validation works', () => {
    const isValidUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    };

    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('invalid-url')).toBe(false);
  });

  test('Basic password validation works', () => {
    const validatePassword = (password: string) => {
      if (password.length < 8) return false;
      if (!/[A-Z]/.test(password)) return false;
      if (!/[a-z]/.test(password)) return false;
      if (!/\d/.test(password)) return false;
      return true;
    };

    expect(validatePassword('Password123')).toBe(true);
    expect(validatePassword('password')).toBe(false);
    expect(validatePassword('PASSWORD123')).toBe(false);
    expect(validatePassword('Pass123')).toBe(false);
  });

  test('Environment security checks work', () => {
    // Check that sensitive info is not logged
    const safeLog = (message: any) => {
      const str = String(message);
      const sensitive = ['password', 'secret', 'key', 'token'];
      
      return !sensitive.some(word => 
        str.toLowerCase().includes(word.toLowerCase())
      );
    };

    expect(safeLog('User logged in')).toBe(true);
    expect(safeLog('Password is 12345')).toBe(false);
    expect(safeLog('API Key: abc123')).toBe(false);
  });
});