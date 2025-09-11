module.exports = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/tests"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/tests/utils/setupTests.ts"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/*.(test|spec).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\\\.(ts|tsx)$": "ts-jest"
  },
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/tests/(.*)$": "<rootDir>/tests/$1"
  },
  "testTimeout": 30000,
  "verbose": true,
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/app/layout.tsx",
    "!src/app/globals.css"
  ],
  "coverageDirectory": "tests/reports/coverage",
  "coverageReporters": [
    "text",
    "lcov",
    "html",
    "json"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  },
  "reporters": [
    "default",
    [
      "jest-html-reporter",
      {
        "pageTitle": "Face Recognition App - Test Results",
        "outputPath": "tests/reports/html/jest-report.html",
        "includeFailureMsg": true,
        "includeSuiteFailure": true
      }
    ]
  ],
  "projects": [
    {
      "displayName": "smoke",
      "testMatch": [
        "<rootDir>/tests/smoke/**/*.test.{ts,js}"
      ],
      "testEnvironment": "node"
    },
    {
      "displayName": "unit",
      "testMatch": [
        "<rootDir>/tests/unit/**/*.test.{ts,tsx,js}"
      ],
      "testEnvironment": "jsdom"
    },
    {
      "displayName": "integration",
      "testMatch": [
        "<rootDir>/tests/integration/**/*.test.{ts,js}"
      ],
      "testEnvironment": "node"
    },
    {
      "displayName": "blackbox",
      "testMatch": [
        "<rootDir>/tests/blackbox/**/*.test.{ts,js}"
      ],
      "testEnvironment": "node",
      "testTimeout": 60000
    },
    {
      "displayName": "security",
      "testMatch": [
        "<rootDir>/tests/security/**/*.test.{ts,js}"
      ],
      "testEnvironment": "node",
      "testTimeout": 120000
    },
    {
      "displayName": "performance",
      "testMatch": [
        "<rootDir>/tests/performance/**/*.test.{ts,js}"
      ],
      "testEnvironment": "node",
      "testTimeout": 300000
    }
  ]
};