import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as registerFaceHandler } from '@/app/api/face/register/route';
import { GET as getFaceStatusHandler } from '@/app/api/face/status/route';
import { DELETE as deleteFaceHandler } from '@/app/api/face/delete/route';
import { TestHelpers } from '@/tests/utils/testHelpers';
import { testUsers, testImages, testFaceDescriptors } from '@/tests/fixtures/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Face Registration API Integration Tests', () => {
  let adminSession: any;
  let userSession: any;

  beforeEach(async () => {
    await TestHelpers.cleanupTestData();
    
    // Create test users
    await prisma.user.createMany({
      data: [
        {
          id: testUsers.admin.id,
          email: testUsers.admin.email,
          name: testUsers.admin.name,
          role: testUsers.admin.role,
          supabaseId: testUsers.admin.supabaseId
        },
        {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        },
        {
          id: testUsers.userWithFace.id,
          email: testUsers.userWithFace.email,
          name: testUsers.userWithFace.name,
          role: testUsers.userWithFace.role,
          supabaseId: testUsers.userWithFace.supabaseId
        }
      ]
    });

    adminSession = await TestHelpers.createTestSession(testUsers.admin);
    userSession = await TestHelpers.createTestSession(testUsers.user);
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/face/register', () => {
    test('should allow admin to register face for any user', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.validFace],
          descriptors: [testFaceDescriptors.valid]
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.faceRegistration).toBeDefined();
      expect(data.data.faceRegistration.userId).toBe(testUsers.user.id);

      // Verify in database
      const knownFace = await prisma.knownFace.findFirst({
        where: { userId: testUsers.user.id }
      });
      expect(knownFace).toBeTruthy();
      expect(knownFace?.hasValidDescriptor).toBe(true);
    });

    test('should deny regular user from registering faces', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.validFace],
          descriptors: [testFaceDescriptors.valid]
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('access');
    });

    test('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id
          // Missing images and descriptors
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    test('should validate face descriptor format', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.validFace],
          descriptors: [testFaceDescriptors.invalid] // Wrong size descriptor
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('descriptor');
    });

    test('should reject duplicate face registration', async () => {
      // First registration
      await prisma.knownFace.create({
        data: {
          id: 'existing-face-id',
          userId: testUsers.user.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.validFace],
          descriptors: [testFaceDescriptors.valid]
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already registered');
    });

    test('should validate image format', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.invalidFormat],
          descriptors: [testFaceDescriptors.valid]
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('image');
    });

    test('should handle multiple descriptors for better accuracy', async () => {
      const multipleDescriptors = [
        testFaceDescriptors.valid,
        TestHelpers.generateMockFaceDescriptor(),
        TestHelpers.generateMockFaceDescriptor()
      ];

      const request = new NextRequest('http://localhost:3000/api/face/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id,
          images: [testImages.validFace, testImages.validFace, testImages.validFace],
          descriptors: multipleDescriptors
        })
      });

      const response = await registerFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.faceRegistration.enrollmentImages).toBe(3);
    });
  });

  describe('GET /api/face/status', () => {
    test('should return face status for user with registration', async () => {
      // Create face registration
      await prisma.knownFace.create({
        data: {
          id: 'test-face-id',
          userId: testUsers.userWithFace.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      // Create some attendance records
      await prisma.attendance.createMany({
        data: [
          {
            faceId: 'test-face-id',
            similarity: 0.95,
            latencyMs: 120,
            model: 'face-api'
          },
          {
            faceId: 'test-face-id',
            similarity: 0.88,
            latencyMs: 95,
            model: 'face-api'
          }
        ]
      });

      const userWithFaceSession = await TestHelpers.createTestSession(testUsers.userWithFace);
      const request = new NextRequest('http://localhost:3000/api/face/status', {
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getFaceStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.hasAccount).toBe(true);
      expect(data.data.hasFaceRegistration).toBe(true);
      expect(data.data.canAccessAttendance).toBe(true);
      expect(data.data.faceRegistration).toBeDefined();
      expect(data.data.attendanceStats).toBeDefined();
      expect(data.data.attendanceStats.totalRecords).toBe(2);
    });

    test('should return status for user without face registration', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/status', {
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getFaceStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.hasAccount).toBe(true);
      expect(data.data.hasFaceRegistration).toBe(false);
      expect(data.data.canAccessAttendance).toBe(false);
      expect(data.data.faceRegistration).toBeNull();
    });

    test('should deny unauthenticated access', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/status');

      const response = await getFaceStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/face/delete', () => {
    test('should allow admin to delete face registration', async () => {
      // Create face registration
      const faceRegistration = await prisma.knownFace.create({
        data: {
          id: 'face-to-delete',
          userId: testUsers.user.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/face/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id
        })
      });

      const response = await deleteFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify deletion
      const deletedFace = await prisma.knownFace.findUnique({
        where: { id: faceRegistration.id }
      });
      expect(deletedFace).toBeNull();
    });

    test('should deny regular user from deleting face registrations', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUsers.user.id
        })
      });

      const response = await deleteFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    test('should handle deletion of non-existent face registration', async () => {
      const request = new NextRequest('http://localhost:3000/api/face/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'non-existent-user-id'
        })
      });

      const response = await deleteFaceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });
});