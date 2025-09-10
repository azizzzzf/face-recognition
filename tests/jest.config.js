/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/utils/setupTests.ts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@/tests/(.*)$': '<rootDir>/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true
    }
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    '../src/**/*.{ts,tsx}',
    '!../src/**/*.d.ts',
    '!../src/**/*.stories.{ts,tsx}',
    '!../src/app/layout.tsx',
    '!../src/app/globals.css',
  ],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  projects: [
    {
      displayName: 'smoke',
      testMatch: ['<rootDir>/smoke/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'unit', 
      testMatch: ['<rootDir>/unit/**/*.test.{ts,tsx,js}'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/integration/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'blackbox',
      testMatch: ['<rootDir>/blackbox/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    }
  ]
};