import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const isDevelopment = process.env.NODE_ENV !== 'production';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isCI, // Disable parallel in CI for stability
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 2, // Limit workers in CI
  timeout: isCI ? 60000 : 30000, // Per test timeout
  
  reporter: [
    ['html', { 
      outputFolder: 'test-results/playwright-report',
      open: isDevelopment ? 'on-failure' : 'never'
    }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ...(isCI ? [['github'] as const] : [])
  ],
  
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: isCI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    // Add reasonable timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add headless setting
        launchOptions: {
          args: isDevelopment ? [] : ['--no-sandbox', '--disable-dev-shm-usage']
        }
      },
    },
    // Only run multiple browsers in CI or when explicitly requested
    ...(process.env.PLAYWRIGHT_BROWSERS === 'all' || isCI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      }
    ] : []),
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: isCI ? 120000 : 60000, // 2 minutes for CI, 1 minute for dev
    stderr: 'pipe',
    stdout: 'pipe',
    // Add better error handling
    env: {
      NODE_ENV: 'development',
      PORT: '3000',
    }
  },
  
  // Global test settings
  expect: {
    // Global expect timeout
    timeout: 10000,
  },
});