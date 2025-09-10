import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as recognizeHandler } from '@/app/api/attendance/recognize/route';
import { GET as getAttendanceHandler } from '@/app/api/attendance/route';
import { GET as getStatsHandler } from '@/app/api/stats/route';
import { TestHelpers } from '@/tests/utils/testHelpers';
import { testUsers, testFaceDescriptors, testImages, testAttendanceRecords } from '@/tests/fixtures/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Attendance API Integration Tests', () => {
  let adminSession: any;
  let userSession: any;
  let userWithFaceSession: any;
  let testFaceId: string;

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

    // Create face registration for test
    const faceRegistration = await prisma.knownFace.create({
      data: {
        userId: testUsers.userWithFace.id,
        descriptor: JSON.stringify(testFaceDescriptors.valid),
        hasValidDescriptor: true,
        model: 'face-api'
      }
    });
    testFaceId = faceRegistration.id;

    adminSession = await TestHelpers.createTestSession(testUsers.admin);
    userSession = await TestHelpers.createTestSession(testUsers.user);
    userWithFaceSession = await TestHelpers.createTestSession(testUsers.userWithFace);
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/attendance/recognize', () => {
    test('should successfully recognize registered face and record attendance', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.validFace,
          descriptor: testFaceDescriptors.valid
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recognized).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.user.id).toBe(testUsers.userWithFace.id);
      expect(data.data.similarity).toBeGreaterThan(0.7);
      expect(data.data.attendanceRecord).toBeDefined();

      // Verify attendance record in database
      const attendanceRecord = await prisma.attendance.findFirst({
        where: { faceId: testFaceId }
      });
      expect(attendanceRecord).toBeTruthy();
      expect(attendanceRecord?.similarity).toBeGreaterThan(0.7);
    });

    test('should reject recognition for unregistered face', async () => {
      const unknownDescriptor = TestHelpers.generateMockFaceDescriptor();
      
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.validFace,
          descriptor: unknownDescriptor
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recognized).toBe(false);
      expect(data.data.reason).toContain('similarity threshold');
    });

    test('should handle invalid image data', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.invalidFormat,
          descriptor: testFaceDescriptors.valid
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('image');
    });

    test('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.validFace
          // Missing descriptor
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    test('should deny unauthenticated access', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: testImages.validFace,
          descriptor: testFaceDescriptors.valid
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    test('should handle face recognition processing time', async () => {
      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.validFace,
          descriptor: testFaceDescriptors.valid
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();
      const processingTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.processingTime).toBeDefined();
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should prevent duplicate attendance within threshold time', async () => {
      // Create recent attendance record
      await prisma.attendance.create({
        data: {
          faceId: testFaceId,
          similarity: 0.95,
          latencyMs: 120,
          model: 'face-api',
          createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      });

      const request = new NextRequest('http://localhost:3000/api/attendance/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImages.validFace,
          descriptor: testFaceDescriptors.valid
        })
      });

      const response = await recognizeHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recognized).toBe(true);
      expect(data.data.duplicate).toBe(true);
      expect(data.data.message).toContain('already recorded');
    });
  });

  describe('GET /api/attendance', () => {
    beforeEach(async () => {
      // Create test attendance records
      await prisma.attendance.createMany({
        data: testAttendanceRecords.map(record => ({
          faceId: testFaceId,
          similarity: record.similarity,
          latencyMs: record.latencyMs,
          model: record.model,
          createdAt: record.createdAt
        }))
      });
    });

    test('should allow admin to fetch all attendance records', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getAttendanceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(testAttendanceRecords.length);
      expect(data.pagination).toBeDefined();
    });

    test('should allow user to fetch their own attendance records', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance', {
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getAttendanceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      // Should only return records for this user's face
      expect(data.data.every((record: any) => record.faceId === testFaceId)).toBe(true);
    });

    test('should support date range filtering', async () => {
      const startDate = '2024-01-02';
      const endDate = '2024-01-03';
      
      const request = new NextRequest(
        `http://localhost:3000/api/attendance?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${adminSession.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const response = await getAttendanceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      // Verify all records are within date range
      data.data.forEach((record: any) => {
        const recordDate = new Date(record.createdAt);
        expect(recordDate >= new Date(startDate)).toBe(true);
        expect(recordDate <= new Date(endDate + 'T23:59:59')).toBe(true);
      });
    });

    test('should support pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance?limit=2&offset=0', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getAttendanceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.offset).toBe(0);
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    test('should deny unauthenticated access', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance');

      const response = await getAttendanceHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/stats', () => {
    beforeEach(async () => {
      // Create test attendance records
      await prisma.attendance.createMany({
        data: testAttendanceRecords.map(record => ({
          faceId: testFaceId,
          similarity: record.similarity,
          latencyMs: record.latencyMs,
          model: record.model,
          createdAt: record.createdAt
        }))
      });
    });

    test('should provide comprehensive statistics for admin', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getStatsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.overview).toBeDefined();
      expect(data.data.overview.totalUsers).toBeGreaterThan(0);
      expect(data.data.overview.totalAttendanceRecords).toBe(testAttendanceRecords.length);
      expect(data.data.userDistribution).toBeDefined();
      expect(data.data.performance).toBeDefined();
    });

    test('should provide limited statistics for regular users', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats', {
        headers: {
          'Authorization': `Bearer ${userWithFaceSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getStatsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.personalStats).toBeDefined();
      expect(data.data.personalStats.totalAttendance).toBe(testAttendanceRecords.length);
      // Should not include admin-only statistics
      expect(data.data.overview).toBeUndefined();
    });

    test('should support date range for statistics', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats?period=7', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getStatsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.overview.periodDays).toBe(7);
    });

    test('should handle performance metrics calculation', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getStatsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.performance.avgProcessingTime).toBeDefined();
      expect(data.data.performance.avgSimilarity).toBeDefined();
      expect(typeof data.data.performance.avgProcessingTime).toBe('number');
      expect(typeof data.data.performance.avgSimilarity).toBe('number');
    });
  });
});