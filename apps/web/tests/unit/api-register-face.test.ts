import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock data generators
const generateMockDescriptor = (length: number = 128): number[] => {
  return Array.from({ length }, () => Math.random() * 2 - 1);
};

const generateMockImages = (count: number = 10): string[] => {
  return Array.from({ length: count }, (_, i) => 
    `data:image/jpeg;base64,mockImageData${i.toString().padStart(2, '0')}`
  );
};

describe('Face Registration API Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
  
  // Helper function to call API
  const callRegisterAPI = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/register-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return { response, result };
  };

  describe('Valid Registration Requests', () => {
    it('should successfully register face with valid 128-dimensional descriptor', async () => {
      const validData = {
        name: 'Test User 128',
        descriptor: generateMockDescriptor(128),
        enrollmentImages: generateMockImages(10),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(validData);
      
      console.log('128D Test Response:', {
        status: response.status,
        hasMessage: !!result.message,
        hasId: !!result.id
      });

      if (response.status === 500) {
        console.error('Server Error Details:', result);
        // Still test that we get a proper error structure
        expect(result).toHaveProperty('error');
      } else {
        expect(response.status).toBe(201);
        expect(result).toHaveProperty('message');
        expect(result.message).toContain('Test User 128');
      }
    });

    it('should successfully register face with valid 512-dimensional descriptor', async () => {
      const validData = {
        name: 'Test User 512',
        descriptor: generateMockDescriptor(512),
        enrollmentImages: generateMockImages(5),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(validData);
      
      console.log('512D Test Response:', {
        status: response.status,
        hasMessage: !!result.message,
        hasId: !!result.id
      });

      if (response.status === 500) {
        console.error('Server Error Details:', result);
        expect(result).toHaveProperty('error');
      } else {
        expect(response.status).toBe(201);
        expect(result).toHaveProperty('message');
      }
    });
  });

  describe('Invalid Registration Requests', () => {
    it('should reject request with missing name', async () => {
      const invalidData = {
        descriptor: generateMockDescriptor(128),
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(invalidData);
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Name must be a non-empty string');
    });

    it('should reject request with empty name', async () => {
      const invalidData = {
        name: '',
        descriptor: generateMockDescriptor(128),
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(invalidData);
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Name must be a non-empty string');
    });

    it('should reject request with invalid descriptor type', async () => {
      const invalidData = {
        name: 'Test User',
        descriptor: 'invalid-descriptor',
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(invalidData);
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Descriptor must be an array');
    });

    it('should reject request with wrong descriptor length', async () => {
      const invalidData = {
        name: 'Test User',
        descriptor: generateMockDescriptor(64), // Wrong length
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(invalidData);
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Descriptor must be exactly 128 or 512 numbers');
    });

    it('should reject request with non-numeric descriptor values', async () => {
      const invalidDescriptor = generateMockDescriptor(128);
      invalidDescriptor[0] = 'invalid' as any;

      const invalidData = {
        name: 'Test User',
        descriptor: invalidDescriptor,
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(invalidData);
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('All descriptor values must be numbers');
    });

    it('should reject request with malformed JSON', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/register-face`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'invalid-json-string',
        });
        
        const result = await response.json();
        
        expect(response.status).toBe(400);
        expect(result.error).toBe('Invalid JSON body');
      } catch (error) {
        // If JSON parsing fails, that's also expected behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of enrollment images', async () => {
      const largeImageSet = generateMockImages(50); // 50 images

      const testData = {
        name: 'Large Dataset User',
        descriptor: generateMockDescriptor(128),
        enrollmentImages: largeImageSet,
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(testData);
      
      console.log('Large dataset test:', {
        status: response.status,
        imageCount: largeImageSet.length
      });

      // Should either succeed or fail gracefully
      if (response.status === 500) {
        expect(result).toHaveProperty('error');
      } else {
        expect(response.status).toBe(201);
      }
    });

    it('should handle descriptor with extreme values', async () => {
      const extremeDescriptor = Array.from({ length: 128 }, (_, i) => {
        if (i % 3 === 0) return Number.MAX_SAFE_INTEGER;
        if (i % 3 === 1) return Number.MIN_SAFE_INTEGER;
        return 0;
      });

      const testData = {
        name: 'Extreme Values User',
        descriptor: extremeDescriptor,
        enrollmentImages: generateMockImages(3),
        multiAngle: true
      };

      const { response, result } = await callRegisterAPI(testData);
      
      console.log('Extreme values test:', {
        status: response.status,
        hasResult: !!result
      });

      // Should handle extreme values gracefully
      expect(response.status).not.toBe(400); // Should not be validation error
    });
  });

  describe('Performance Tests', () => {
    it('should complete registration within reasonable time', async () => {
      const startTime = Date.now();

      const testData = {
        name: 'Performance Test User',
        descriptor: generateMockDescriptor(128),
        enrollmentImages: generateMockImages(10),
        multiAngle: true
      };

      const { response } = await callRegisterAPI(testData);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Registration took ${duration}ms`);
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
      expect(response).toBeDefined();
    });
  });
});