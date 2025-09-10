/**
 * Test Configuration
 * Centralized configuration for all test suites
 */

export const TestConfig = {
  // Base URLs
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000/api',

  // Test Timeouts
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    upload: 60000
  },

  // Test Data Paths
  paths: {
    fixtures: '/tests/fixtures',
    images: '/tests/fixtures/images',
    reports: '/tests/reports',
    screenshots: '/tests/reports/screenshots'
  },

  // Database Config
  database: {
    testDb: 'face_recognition_test',
    cleanupTimeout: 10000
  },

  // Performance Thresholds
  performance: {
    pageLoadTime: 3000,
    apiResponseTime: 1000,
    faceRecognitionTime: 3000,
    memoryUsage: 100 * 1024 * 1024, // 100MB
    cpuUsage: 80 // percentage
  },

  // Security Testing
  security: {
    maxLoginAttempts: 5,
    passwordComplexity: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    rateLimits: {
      api: 100, // requests per minute
      login: 5, // attempts per minute
      upload: 10 // uploads per minute
    }
  },

  // Face Recognition Settings
  faceRecognition: {
    confidenceThreshold: 0.8,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    minImageDimensions: { width: 100, height: 100 },
    maxImageDimensions: { width: 4000, height: 4000 }
  },

  // Test Users
  testUsers: {
    admin: {
      email: 'admin@test.com',
      password: 'AdminPass123!',
      name: 'Test Admin',
      role: 'ADMIN'
    },
    regularUser: {
      email: 'user@test.com',
      password: 'UserPass123!',
      name: 'Test User',
      role: 'USER'
    },
    userWithFace: {
      email: 'userface@test.com',
      password: 'UserFace123!',
      name: 'Test User With Face',
      role: 'USER',
      hasFaceRegistration: true
    }
  },

  // Browsers for E2E Testing
  browsers: ['chromium', 'firefox', 'webkit'],

  // Mobile Devices for Responsive Testing
  mobileDevices: [
    'iPhone 12',
    'iPhone SE',
    'Samsung Galaxy S21',
    'iPad',
    'Pixel 5'
  ]
};

export default TestConfig;