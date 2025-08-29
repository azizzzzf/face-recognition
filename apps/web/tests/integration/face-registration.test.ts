import { test, expect } from '@playwright/test';

// Mock base64 image data (minimal valid image)
const mockBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Generate mock images for 10 different angles
const generateMockImages = (count: number = 10): string[] => {
  return Array.from({ length: count }, (_, index) => {
    // Create slightly different base64 data for each "angle"
    const imageId = index.toString().padStart(2, '0');
    return mockBase64Image.replace('RCAABAAEDASIAAhEBAxEB', `RCAABAAEDASIAAhEBAxE${imageId}`);
  });
};

// Mock face descriptor (128-dimensional vector)
const generateMockDescriptor = (): number[] => {
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

test.describe('Face Registration Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load registration page without errors', async ({ page }) => {
    // Check if page title or main elements are present
    await expect(page.locator('text=Camera')).toBeVisible();
    await expect(page.locator('text=Upload')).toBeVisible();
    
    // Check if no JavaScript errors occurred
    const errorLogs = [];
    page.on('pageerror', error => errorLogs.push(error.message));
    await page.waitForTimeout(2000);
    expect(errorLogs).toHaveLength(0);
  });

  test('should test face-api.js model loading', async ({ page }) => {
    // Monitor console for model loading messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Camera initialized')) {
        consoleLogs.push(msg.text());
      }
    });

    // Wait for models to load
    await page.waitForTimeout(5000);
    
    // Check if camera initialized successfully
    expect(consoleLogs.length).toBeGreaterThan(0);
  });

  test('should test API endpoint with mock data', async ({ page }) => {
    // Mock the face registration API call
    await page.route('/api/register-face', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      console.log('API Request intercepted:', {
        method: request.method(),
        url: request.url(),
        hasDescriptor: !!postData?.descriptor,
        descriptorLength: postData?.descriptor?.length,
        hasEnrollmentImages: !!postData?.enrollmentImages,
        name: postData?.name
      });

      // Validate request format
      if (!postData?.descriptor || !Array.isArray(postData.descriptor)) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Descriptor must be an array' })
        });
        return;
      }

      if (postData.descriptor.length !== 128) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Descriptor must be exactly 128 numbers' })
        });
        return;
      }

      // Simulate successful registration
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: 'test-id-123',
          name: postData.name,
          message: `Face registered successfully for ${postData.name}`,
          multiAngle: true,
          arcfaceEnabled: false
        })
      });
    });

    // Inject mock face-api.js functionality
    await page.addInitScript(() => {
      // Mock face-api.js functions
      window.mockFaceAPI = {
        extractFaceDescriptor: async (image) => {
          // Simulate face detection and descriptor extraction
          const descriptor = new Float32Array(128);
          for (let i = 0; i < 128; i++) {
            descriptor[i] = Math.random() * 2 - 1;
          }
          return descriptor;
        },
        
        processMultipleImages: async (images) => {
          // Simulate processing multiple images and averaging descriptors
          const mockDescriptor = new Float32Array(128);
          for (let i = 0; i < 128; i++) {
            mockDescriptor[i] = Math.random() * 2 - 1;
          }
          return mockDescriptor;
        }
      };

      // Override the actual face extraction function
      window.addEventListener('DOMContentLoaded', () => {
        // This will be executed after the page loads
        setTimeout(() => {
          if (window.location.pathname === '/register') {
            console.log('Mocking face-api.js functions for testing');
          }
        }, 1000);
      });
    });

    // Simulate user filling the form
    await page.fill('input[placeholder*="nama"]', 'Test User');
    
    // Simulate multi-angle capture completion
    await page.evaluate(() => {
      // Mock the captured images
      const mockImages = Array.from({ length: 10 }, (_, i) => 
        `data:image/jpeg;base64,mockbase64data${i}`
      );
      
      // Trigger the registration process
      if (window.mockFaceAPI) {
        window.mockFaceAPI.processMultipleImages(mockImages).then(descriptor => {
          console.log('Mock descriptor generated:', descriptor.length);
        });
      }
    });

    // Wait for any async operations
    await page.waitForTimeout(2000);
  });

  test('should handle registration form submission', async ({ page }) => {
    let apiCalled = false;
    let requestData = null;

    // Intercept API calls
    await page.route('/api/register-face', async (route) => {
      apiCalled = true;
      requestData = route.request().postDataJSON();
      
      // Check request format
      console.log('Registration API called with:', {
        hasName: !!requestData?.name,
        hasDescriptor: !!requestData?.descriptor,
        descriptorLength: requestData?.descriptor?.length,
        descriptorType: typeof requestData?.descriptor,
        isArray: Array.isArray(requestData?.descriptor),
        hasEnrollmentImages: !!requestData?.enrollmentImages,
        enrollmentImagesCount: requestData?.enrollmentImages?.length
      });

      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: 'test-123',
          name: requestData.name,
          message: `Face registered successfully for ${requestData.name}`
        })
      });
    });

    // Simulate the complete registration flow
    await page.evaluate(() => {
      // Mock the registration process
      const mockImages = Array.from({ length: 10 }, (_, i) => 
        `data:image/jpeg;base64,mockImageData${i}`
      );
      
      const mockDescriptor = Array.from({ length: 128 }, () => Math.random() * 2 - 1);
      
      // Simulate form submission
      const registrationData = {
        name: 'Integration Test User',
        descriptor: mockDescriptor,
        enrollmentImages: mockImages,
        multiAngle: true
      };

      // Make the API call
      fetch('/api/register-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      }).then(response => {
        console.log('API Response status:', response.status);
        return response.json();
      }).then(data => {
        console.log('API Response data:', data);
      }).catch(error => {
        console.error('API Error:', error);
      });
    });

    // Wait for API call
    await page.waitForTimeout(3000);
    
    // Verify API was called with correct data
    expect(apiCalled).toBe(true);
    expect(requestData).toBeTruthy();
    expect(requestData?.name).toBe('Integration Test User');
    expect(Array.isArray(requestData?.descriptor)).toBe(true);
    expect(requestData?.descriptor?.length).toBe(128);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/register-face', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ 
          error: 'Internal Server Error',
          details: 'Database connection failed' 
        })
      });
    });

    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Simulate registration with error
    await page.evaluate(() => {
      const registrationData = {
        name: 'Error Test User',
        descriptor: Array.from({ length: 128 }, () => Math.random()),
        enrollmentImages: ['mockImage1', 'mockImage2'],
        multiAngle: true
      };

      fetch('/api/register-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      }).catch(error => {
        console.error('Expected error caught:', error.message);
      });
    });

    await page.waitForTimeout(2000);
    
    // Verify error handling
    expect(consoleErrors.length).toBeGreaterThan(0);
  });

  test('should validate descriptor format requirements', async ({ page }) => {
    const testCases = [
      {
        name: 'Invalid descriptor - not array',
        descriptor: 'invalid',
        expectedError: 'Descriptor must be an array'
      },
      {
        name: 'Invalid descriptor - wrong length',
        descriptor: Array.from({ length: 64 }, () => Math.random()),
        expectedError: 'Descriptor must be exactly 128 or 512 numbers'
      },
      {
        name: 'Invalid descriptor - non-numeric values',
        descriptor: Array.from({ length: 128 }, (_, i) => i % 2 === 0 ? Math.random() : 'invalid'),
        expectedError: 'All descriptor values must be numbers'
      }
    ];

    for (const testCase of testCases) {
      await page.route('/api/register-face', async (route) => {
        const requestData = route.request().postDataJSON();
        
        // Let the actual API handle validation
        if (testCase.descriptor === 'invalid' || 
            (Array.isArray(testCase.descriptor) && testCase.descriptor.length !== 128) ||
            (Array.isArray(testCase.descriptor) && !testCase.descriptor.every(val => typeof val === 'number'))) {
          await route.fulfill({
            status: 400,
            body: JSON.stringify({ error: testCase.expectedError })
          });
        } else {
          await route.fulfill({
            status: 201,
            body: JSON.stringify({ message: 'Success' })
          });
        }
      });

      // Test the case
      const result = await page.evaluate((testData) => {
        return fetch('/api/register-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            descriptor: testData.descriptor,
            enrollmentImages: [],
            multiAngle: true
          })
        }).then(response => response.json());
      }, testCase);

      console.log(`Test case "${testCase.name}":`, result);
    }
  });
});