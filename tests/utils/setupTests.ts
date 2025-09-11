
import { TestConfig } from './testConfig';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  console.log('🔧 Setting up test environment...');
  
  // Clear any existing test data
  await cleanupTestData();
  
  // Seed test data if needed
  await seedTestData();
});

afterAll(async () => {
  // Cleanup after tests
  console.log('🧹 Cleaning up test environment...');
  await cleanupTestData();
});

export const cleanupTestData = async (): Promise<void> => {
  // Implementation to clean test database
  console.log('Cleaning test data...');
};

export const seedTestData = async (): Promise<void> => {
  // Implementation to seed test data
  console.log('Seeding test data...');
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidImage(): R;
      toHaveFaceDetected(): R;
      toBeWithinPerformanceThreshold(threshold: number): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidImage(received) {
    const isValid = received && received.length > 0 && 
                   (received.includes('data:image/') || Buffer.isBuffer(received));
    
    return {
      message: () => `expected ${received} to be a valid image`,
      pass: isValid
    };
  },
  
  toHaveFaceDetected(received) {
    const hasFace = received && received.faces && received.faces.length > 0;
    
    return {
      message: () => `expected image to have face detected`,
      pass: hasFace
    };
  },
  
  toBeWithinPerformanceThreshold(received, threshold) {
    const isWithin = received <= threshold;
    
    return {
      message: () => `expected ${received}ms to be within ${threshold}ms`,
      pass: isWithin
    };
  }
});
