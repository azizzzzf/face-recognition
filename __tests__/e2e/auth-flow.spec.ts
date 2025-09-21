/**
 * End-to-End Tests - Authentication Flow
 * Complete user authentication journey testing
 */

import { test, expect } from '@playwright/test';
import TestConfig from '../utils/testConfig';

test.describe('Authentication Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TestConfig.baseUrl);
  });

  test('Complete login flow - valid credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.click('[data-testid="login-link"], a[href*="login"]');
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('h1, h2')).toContainText(/login|masuk/i);
    });

    await test.step('Fill login form with valid credentials', async () => {
      await page.fill('[name="email"]', TestConfig.testUsers.regularUser.email);
      await page.fill('[name="password"]', TestConfig.testUsers.regularUser.password);
      
      // Verify form is filled
      await expect(page.locator('[name="email"]')).toHaveValue(TestConfig.testUsers.regularUser.email);
      await expect(page.locator('[name="password"]')).toHaveValue(TestConfig.testUsers.regularUser.password);
    });

    await test.step('Submit login form', async () => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('[type="submit"]')
      ]);
    });

    await test.step('Verify successful login', async () => {
      // Check URL changed to dashboard or home
      await expect(page).toHaveURL(/.*\/(dashboard|$)/);
      
      // Check for user indicator elements
      await expect(page.locator('[data-testid="user-menu"], .user-profile, [aria-label*="user"]')).toBeVisible();
      
      // Check for logout option
      await expect(page.locator('[data-testid="logout"], a[href*="logout"], button:has-text("Logout")')).toBeVisible();
    });

    await test.step('Verify user can access protected content', async () => {
      // Try to access a protected page
      await page.goto(`${TestConfig.baseUrl}/dashboard`);
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Should not be redirected to login
      await expect(page).not.toHaveURL(/.*login/);
    });
  });

  test('Login flow - invalid credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/login`);
    });

    await test.step('Fill form with invalid credentials', async () => {
      await page.fill('[name="email"]', 'invalid@test.com');
      await page.fill('[name="password"]', 'wrongpassword');
    });

    await test.step('Submit form and verify error', async () => {
      await page.click('[type="submit"]');
      
      // Wait for error message
      await page.waitForSelector('.error-message, .alert-error, [role="alert"], .text-red-500');
      
      // Verify error message
      const errorMessage = page.locator('.error-message, .alert-error, [role="alert"], .text-red-500');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/invalid|credentials|not found/i);
      
      // Verify still on login page
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test('Registration flow - new user', async ({ page }) => {
    const timestamp = Date.now();
    const newUser = {
      name: 'E2E Test User',
      email: `e2etest${timestamp}@test.com`,
      password: 'E2ETestPass123!'
    };

    await test.step('Navigate to registration page', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/register`);
      await expect(page.locator('h1, h2')).toContainText(/register|daftar/i);
    });

    await test.step('Fill registration form', async () => {
      await page.fill('[name="name"]', newUser.name);
      await page.fill('[name="email"]', newUser.email);
      await page.fill('[name="password"]', newUser.password);
      
      // Verify form is filled correctly
      await expect(page.locator('[name="name"]')).toHaveValue(newUser.name);
      await expect(page.locator('[name="email"]')).toHaveValue(newUser.email);
    });

    await test.step('Submit registration form', async () => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('[type="submit"]')
      ]);
    });

    await test.step('Verify registration success', async () => {
      // Should redirect to login page or show success message
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('login');
      const hasSuccessMessage = await page.locator('.success-message, .alert-success').count() > 0;
      
      expect(isLoginPage || hasSuccessMessage).toBeTruthy();
    });

    await test.step('Login with new credentials', async () => {
      // If not on login page, navigate there
      if (!page.url().includes('login')) {
        await page.goto(`${TestConfig.baseUrl}/auth/login`);
      }
      
      await page.fill('[name="email"]', newUser.email);
      await page.fill('[name="password"]', newUser.password);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('[type="submit"]')
      ]);
      
      // Verify successful login with new account
      await expect(page).toHaveURL(/.*\/(dashboard|$)/);
    });
  });

  test('Protected route access without authentication', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/users', '/attendance', '/register'];
    
    for (const route of protectedRoutes) {
      await test.step(`Access protected route: ${route}`, async () => {
        await page.goto(`${TestConfig.baseUrl}${route}`);
        
        // Should be redirected to login
        await page.waitForURL(/.*login/, { timeout: 5000 });
        await expect(page).toHaveURL(/.*login/);
        
        // Check for login form
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
      });
    }
  });

  test('Session persistence across browser refresh', async ({ page }) => {
    await test.step('Login first', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/login`);
      await page.fill('[name="email"]', TestConfig.testUsers.regularUser.email);
      await page.fill('[name="password"]', TestConfig.testUsers.regularUser.password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('[type="submit"]')
      ]);
    });

    await test.step('Refresh page and verify session', async () => {
      await page.reload({ waitUntil: 'networkidle' });
      
      // Should still be logged in
      await expect(page).not.toHaveURL(/.*login/);
      await expect(page.locator('[data-testid="user-menu"], .user-profile')).toBeVisible();
    });

    await test.step('Navigate to protected page after refresh', async () => {
      await page.goto(`${TestConfig.baseUrl}/dashboard`);
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page).not.toHaveURL(/.*login/);
    });
  });

  test('Logout flow', async ({ page }) => {
    await test.step('Login first', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/login`);
      await page.fill('[name="email"]', TestConfig.testUsers.regularUser.email);
      await page.fill('[name="password"]', TestConfig.testUsers.regularUser.password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('[type="submit"]')
      ]);
    });

    await test.step('Perform logout', async () => {
      // Find and click logout button/link
      const logoutSelector = '[data-testid="logout"], a[href*="logout"], button:has-text("Logout"), button:has-text("Keluar")';
      await page.click(logoutSelector);
      
      // Wait for navigation to login page
      await page.waitForURL(/.*login/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*login/);
    });

    await test.step('Verify logout is complete', async () => {
      // Try to access protected page
      await page.goto(`${TestConfig.baseUrl}/dashboard`);
      
      // Should be redirected back to login
      await page.waitForURL(/.*login/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*login/);
    });

    await test.step('Verify browser back button does not bypass logout', async () => {
      await page.goBack();
      await page.waitForTimeout(1000);
      
      // Should still be on login page or redirected to login
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login/);
    });
  });

  test('Form validation - email format', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/login`);
    });

    await test.step('Test invalid email formats', async () => {
      const invalidEmails = ['invalid-email', 'test@', '@domain.com', 'test.com'];
      
      for (const email of invalidEmails) {
        await page.fill('[name="email"]', '');
        await page.fill('[name="email"]', email);
        await page.fill('[name="password"]', 'somepassword');
        
        await page.click('[type="submit"]');
        await page.waitForTimeout(1000);
        
        // Check for validation error
        const emailInput = page.locator('[name="email"]');
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        
        expect(validationMessage.toLowerCase()).toMatch(/email|valid/);
      }
    });
  });

  test('Form validation - required fields', async ({ page }) => {
    await test.step('Navigate to registration page', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/register`);
    });

    await test.step('Test required field validation', async () => {
      // Try to submit empty form
      await page.click('[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Check that form is not submitted (still on register page)
      await expect(page).toHaveURL(/.*register/);
      
      // Check for validation messages on required fields
      const nameInput = page.locator('[name="name"]');
      const emailInput = page.locator('[name="email"]');
      const passwordInput = page.locator('[name="password"]');
      
      // Verify HTML5 validation is working
      expect(await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBeFalsy();
      expect(await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBeFalsy();
      expect(await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBeFalsy();
    });
  });

  test('Password strength validation', async ({ page }) => {
    await test.step('Navigate to registration page', async () => {
      await page.goto(`${TestConfig.baseUrl}/auth/register`);
    });

    await test.step('Test weak password rejection', async () => {
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@example.com');
      
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];
      
      for (const password of weakPasswords) {
        await page.fill('[name="password"]', '');
        await page.fill('[name="password"]', password);
        
        await page.click('[type="submit"]');
        await page.waitForTimeout(2000);
        
        // Should show password strength error or stay on page
        const errorMessage = await page.locator('.error-message, .alert-error, .text-red-500').textContent();
        const isStillOnRegisterPage = page.url().includes('register');
        
        expect(isStillOnRegisterPage).toBeTruthy();
        
        if (errorMessage) {
          expect(errorMessage.toLowerCase()).toMatch(/password|weak|strength/);
        }
      }
    });
  });

  test('Concurrent login sessions', async ({ browser }) => {
    // Test multiple browser contexts (simulating different devices)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await test.step('Login from first browser', async () => {
      await page1.goto(`${TestConfig.baseUrl}/auth/login`);
      await page1.fill('[name="email"]', TestConfig.testUsers.regularUser.email);
      await page1.fill('[name="password"]', TestConfig.testUsers.regularUser.password);
      await Promise.all([
        page1.waitForNavigation({ waitUntil: 'networkidle' }),
        page1.click('[type="submit"]')
      ]);
      
      await expect(page1).toHaveURL(/.*\/(dashboard|$)/);
    });

    await test.step('Login from second browser with same credentials', async () => {
      await page2.goto(`${TestConfig.baseUrl}/auth/login`);
      await page2.fill('[name="email"]', TestConfig.testUsers.regularUser.email);
      await page2.fill('[name="password"]', TestConfig.testUsers.regularUser.password);
      await Promise.all([
        page2.waitForNavigation({ waitUntil: 'networkidle' }),
        page2.click('[type="submit"]')
      ]);
      
      await expect(page2).toHaveURL(/.*\/(dashboard|$)/);
    });

    await test.step('Verify both sessions work independently', async () => {
      // Both should be able to access protected pages
      await page1.goto(`${TestConfig.baseUrl}/dashboard`);
      await expect(page1).toHaveURL(/.*dashboard/);
      
      await page2.goto(`${TestConfig.baseUrl}/dashboard`);
      await expect(page2).toHaveURL(/.*dashboard/);
    });

    await context1.close();
    await context2.close();
  });
});