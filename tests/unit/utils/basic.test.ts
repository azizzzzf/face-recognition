import { describe, test, expect } from '@jest/globals';

describe('Unit Tests - Basic Utilities', () => {
  test('Array operations work correctly', () => {
    const arr = [1, 2, 3, 4, 5];
    
    expect(arr.length).toBe(5);
    expect(arr.filter(n => n > 3)).toEqual([4, 5]);
    expect(arr.map(n => n * 2)).toEqual([2, 4, 6, 8, 10]);
    expect(arr.reduce((sum, n) => sum + n, 0)).toBe(15);
  });

  test('Object operations work correctly', () => {
    const obj = { name: 'Test User', age: 25, active: true };
    
    expect(Object.keys(obj)).toEqual(['name', 'age', 'active']);
    expect(Object.values(obj)).toEqual(['Test User', 25, true]);
    expect(obj.name).toBe('Test User');
    expect(obj.age).toBe(25);
    expect(obj.active).toBe(true);
  });

  test('String operations work correctly', () => {
    const str = 'Hello World';
    
    expect(str.toLowerCase()).toBe('hello world');
    expect(str.toUpperCase()).toBe('HELLO WORLD');
    expect(str.split(' ')).toEqual(['Hello', 'World']);
    expect(str.includes('World')).toBe(true);
    expect(str.startsWith('Hello')).toBe(true);
  });

  test('Date operations work correctly', () => {
    const now = new Date();
    const timestamp = now.getTime();
    
    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThan(0);
    expect(new Date(timestamp).getTime()).toBe(timestamp);
  });

  test('Regular expressions work correctly', () => {
    const email = 'test@example.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test(email)).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });
});