/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/blackbox'],
  testMatch: ['**/blackbox/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
      isolatedModules: true
    }]
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^node-fetch$': '<rootDir>/node_modules/node-fetch/lib/index.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|form-data)/)'
  ],
  extensionsToTreatAsEsm: [],
  globals: {},
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setupTests.ts']
};