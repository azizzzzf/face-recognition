#!/usr/bin/env node
/**
 * Setup Test Environment Script
 * Initializes test fixtures, sample data, and test configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up comprehensive test environment...');

// Create directory structure
const directories = [
  'tests/reports/html',
  'tests/reports/json', 
  'tests/reports/csv',
  'tests/reports/screenshots',
  'tests/reports/coverage',
  'tests/fixtures/images',
  'tests/fixtures/data',
  'tests/fixtures/files'
];

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create sample test images using simple data patterns
const createTestImage = (filePath, width, height, pattern = 0) => {
  const imageSize = width * height * 3; // RGB
  const buffer = Buffer.alloc(imageSize);
  
  for (let i = 0; i < imageSize; i += 3) {
    // Create simple patterns for different test images
    switch (pattern) {
      case 0: // Valid face pattern (skin tone with features)
        buffer[i] = 255;     // R - light
        buffer[i + 1] = 220; // G - skin tone  
        buffer[i + 2] = 177; // B - skin tone
        break;
      case 1: // Blurry/low quality
        const gray = Math.floor(Math.random() * 100) + 128;
        buffer[i] = gray;
        buffer[i + 1] = gray;
        buffer[i + 2] = gray;
        break;
      case 2: // Multiple faces simulation
        buffer[i] = 200;
        buffer[i + 1] = 150;
        buffer[i + 2] = 100;
        break;
      case 3: // Landscape (no face)
        buffer[i] = 135;     // Sky blue
        buffer[i + 1] = 206;
        buffer[i + 2] = 235;
        break;
      default:
        buffer[i] = pattern;
        buffer[i + 1] = pattern;
        buffer[i + 2] = pattern;
    }
  }
  
  // Add simple JPEG-like header
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
  ]);
  const jpegFooter = Buffer.from([0xFF, 0xD9]);
  
  const finalBuffer = Buffer.concat([jpegHeader, buffer, jpegFooter]);
  fs.writeFileSync(filePath, finalBuffer);
  return filePath;
};

// Generate test images
const testImages = [
  { name: 'valid-face.jpg', width: 640, height: 480, pattern: 0 },
  { name: 'blurry-face.jpg', width: 320, height: 240, pattern: 1 },
  { name: 'multiple-faces.jpg', width: 800, height: 600, pattern: 2 },
  { name: 'landscape.jpg', width: 1024, height: 768, pattern: 3 },
  { name: 'large-face.jpg', width: 2048, height: 1536, pattern: 0 },
  { name: 'profile-face.jpg', width: 480, height: 640, pattern: 0 },
  { name: 'masked-face.jpg', width: 640, height: 480, pattern: 0 },
  { name: 'test-face.jpg', width: 640, height: 480, pattern: 0 },
];

testImages.forEach(img => {
  const imagePath = path.join(process.cwd(), 'tests/fixtures/images', img.name);
  createTestImage(imagePath, img.width, img.height, img.pattern);
  console.log(`✅ Created test image: ${img.name} (${img.width}x${img.height})`);
});

// Create test data fixtures
const testData = {
  users: [
    {
      id: 'test-user-1',
      email: 'testuser1@example.com',
      name: 'Test User One',
      role: 'USER',
      supabaseId: 'supabase-test-1',
      password: 'TestPass123!',
      hasFaceRegistration: true
    },
    {
      id: 'test-user-2', 
      email: 'testuser2@example.com',
      name: 'Test User Two',
      role: 'USER',
      supabaseId: 'supabase-test-2',
      password: 'TestPass123!',
      hasFaceRegistration: false
    },
    {
      id: 'test-admin-1',
      email: 'testadmin@example.com', 
      name: 'Test Admin',
      role: 'ADMIN',
      supabaseId: 'supabase-admin-1',
      password: 'AdminPass123!',
      hasFaceRegistration: true
    }
  ],
  faceRegistrations: [
    {
      id: 'face-reg-1',
      userId: 'test-user-1',
      descriptors: Array.from({ length: 128 }, () => Math.random()),
      landmarks: Array.from({ length: 68 }, (_, i) => ({ x: i * 10, y: i * 8 })),
      confidence: 0.95,
      registeredAt: new Date().toISOString()
    }
  ],
  attendanceRecords: [
    {
      id: 'attendance-1',
      userId: 'test-user-1',
      timestamp: new Date().toISOString(),
      confidence: 0.92,
      status: 'PRESENT'
    }
  ]
};

// Save test data
fs.writeFileSync(
  path.join(process.cwd(), 'tests/fixtures/data/test-data.json'),
  JSON.stringify(testData, null, 2)
);
console.log('✅ Created test data fixtures');

// Create invalid test files
const invalidFiles = [
  { name: 'document.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF' },
  { name: 'script.js', content: 'console.log("malicious script");' },
  { name: 'large-file.dat', size: 15 * 1024 * 1024 } // 15MB
];

invalidFiles.forEach(file => {
  const filePath = path.join(process.cwd(), 'tests/fixtures/files', file.name);
  if (file.size) {
    // Create large file
    const buffer = Buffer.alloc(file.size, 0);
    fs.writeFileSync(filePath, buffer);
  } else {
    fs.writeFileSync(filePath, file.content);
  }
  console.log(`✅ Created test file: ${file.name}`);
});

// Create enhanced Jest configuration for different test types
const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setupTests.ts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  coverageDirectory: 'tests/reports/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Face Recognition App - Test Results',
      outputPath: 'tests/reports/html/jest-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ],
  projects: [
    {
      displayName: 'smoke',
      testMatch: ['<rootDir>/tests/smoke/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx,js}'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'blackbox',
      testMatch: ['<rootDir>/tests/blackbox/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      testTimeout: 60000
    },
    {
      displayName: 'security',
      testMatch: ['<rootDir>/tests/security/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      testTimeout: 120000
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      testTimeout: 300000
    }
  ]
};

fs.writeFileSync(
  path.join(process.cwd(), 'jest.config.comprehensive.js'),
  `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
);
console.log('✅ Created comprehensive Jest configuration');

// Create Playwright configuration
const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/reports/html/playwright-report' }],
    ['json', { outputFile: 'tests/reports/json/playwright-results.json' }],
    ['junit', { outputFile: 'tests/reports/junit.xml' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});`;

fs.writeFileSync(
  path.join(process.cwd(), 'playwright.config.comprehensive.ts'),
  playwrightConfig
);
console.log('✅ Created comprehensive Playwright configuration');

// Create test setup utilities
const setupUtils = `
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
      message: () => \`expected \${received} to be a valid image\`,
      pass: isValid
    };
  },
  
  toHaveFaceDetected(received) {
    const hasFace = received && received.faces && received.faces.length > 0;
    
    return {
      message: () => \`expected image to have face detected\`,
      pass: hasFace
    };
  },
  
  toBeWithinPerformanceThreshold(received, threshold) {
    const isWithin = received <= threshold;
    
    return {
      message: () => \`expected \${received}ms to be within \${threshold}ms\`,
      pass: isWithin
    };
  }
});
`;

fs.writeFileSync(
  path.join(process.cwd(), 'tests/utils/setupTests.ts'),
  setupUtils
);
console.log('✅ Created test setup utilities');

console.log('\n🎉 Test environment setup completed successfully!');
console.log('\n📋 Available test commands:');
console.log('  npm run test              - Run all tests');
console.log('  npm run test:smoke        - Run smoke tests');
console.log('  npm run test:unit         - Run unit tests');
console.log('  npm run test:integration  - Run integration tests');
console.log('  npm run test:e2e          - Run E2E tests');
console.log('  npm run test:blackbox     - Run blackbox tests');
console.log('  npm run test:security     - Run security tests');
console.log('  npm run test:performance  - Run performance tests');
console.log('  npm run test:coverage     - Generate coverage report');
console.log('  npm run test:reports      - Generate all reports');
console.log('\n🚀 Ready for comprehensive testing!');