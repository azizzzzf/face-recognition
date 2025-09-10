import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { TestHelpers } from '@/tests/utils/testHelpers';
import { testUsers, testFaceDescriptors } from '@/tests/fixtures/testData';

const prisma = new PrismaClient();

describe('Database Integration Tests', () => {
  beforeEach(async () => {
    await TestHelpers.cleanupTestData();
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData();
    await prisma.$disconnect();
  });

  describe('User Model Operations', () => {
    test('should create user with all required fields', async () => {
      const user = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      expect(user).toBeTruthy();
      expect(user.id).toBe(testUsers.user.id);
      expect(user.email).toBe(testUsers.user.email);
      expect(user.name).toBe(testUsers.user.name);
      expect(user.role).toBe(testUsers.user.role);
      expect(user.supabaseId).toBe(testUsers.user.supabaseId);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      await expect(
        prisma.user.create({
          data: {
            id: 'different-id',
            email: testUsers.user.email, // Same email
            name: 'Different Name',
            role: 'USER',
            supabaseId: 'different-supabase-id'
          }
        })
      ).rejects.toThrow();
    });

    test('should enforce unique supabaseId constraint', async () => {
      await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      await expect(
        prisma.user.create({
          data: {
            id: 'different-id',
            email: 'different@email.com',
            name: 'Different Name',
            role: 'USER',
            supabaseId: testUsers.user.supabaseId // Same supabaseId
          }
        })
      ).rejects.toThrow();
    });

    test('should update user fields correctly', async () => {
      const user = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'Updated Name',
          role: 'ADMIN'
        }
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.role).toBe('ADMIN');
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });

    test('should delete user and cascade to related records', async () => {
      const user = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      // Create related face registration
      const knownFace = await prisma.knownFace.create({
        data: {
          userId: user.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      // Create related attendance
      await prisma.attendance.create({
        data: {
          faceId: knownFace.id,
          similarity: 0.95,
          latencyMs: 120,
          model: 'face-api'
        }
      });

      // Delete user
      await prisma.user.delete({
        where: { id: user.id }
      });

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(deletedUser).toBeNull();

      // Verify related records are also deleted (cascade)
      const deletedFace = await prisma.knownFace.findUnique({
        where: { id: knownFace.id }
      });
      expect(deletedFace).toBeNull();

      const remainingAttendance = await prisma.attendance.findMany({
        where: { faceId: knownFace.id }
      });
      expect(remainingAttendance.length).toBe(0);
    });
  });

  describe('KnownFace Model Operations', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });
    });

    test('should create face registration with valid descriptor', async () => {
      const knownFace = await prisma.knownFace.create({
        data: {
          userId: testUser.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      expect(knownFace).toBeTruthy();
      expect(knownFace.userId).toBe(testUser.id);
      expect(knownFace.hasValidDescriptor).toBe(true);
      expect(knownFace.model).toBe('face-api');
      expect(knownFace.createdAt).toBeDefined();
    });

    test('should enforce one face registration per user', async () => {
      await prisma.knownFace.create({
        data: {
          userId: testUser.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      await expect(
        prisma.knownFace.create({
          data: {
            userId: testUser.id, // Same user
            descriptor: JSON.stringify(TestHelpers.generateMockFaceDescriptor()),
            hasValidDescriptor: true,
            model: 'face-api'
          }
        })
      ).rejects.toThrow();
    });

    test('should validate foreign key constraint', async () => {
      await expect(
        prisma.knownFace.create({
          data: {
            userId: 'non-existent-user-id',
            descriptor: JSON.stringify(testFaceDescriptors.valid),
            hasValidDescriptor: true,
            model: 'face-api'
          }
        })
      ).rejects.toThrow();
    });

    test('should update face registration correctly', async () => {
      const knownFace = await prisma.knownFace.create({
        data: {
          userId: testUser.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: false,
          model: 'face-api'
        }
      });

      const updatedFace = await prisma.knownFace.update({
        where: { id: knownFace.id },
        data: {
          hasValidDescriptor: true,
          enrollmentImages: 3
        }
      });

      expect(updatedFace.hasValidDescriptor).toBe(true);
      expect(updatedFace.enrollmentImages).toBe(3);
    });
  });

  describe('Attendance Model Operations', () => {
    let testUser: any;
    let testFace: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      testFace = await prisma.knownFace.create({
        data: {
          userId: testUser.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });
    });

    test('should create attendance record with required fields', async () => {
      const attendance = await prisma.attendance.create({
        data: {
          faceId: testFace.id,
          similarity: 0.95,
          latencyMs: 120,
          model: 'face-api'
        }
      });

      expect(attendance).toBeTruthy();
      expect(attendance.faceId).toBe(testFace.id);
      expect(attendance.similarity).toBe(0.95);
      expect(attendance.latencyMs).toBe(120);
      expect(attendance.model).toBe('face-api');
      expect(attendance.createdAt).toBeDefined();
    });

    test('should validate foreign key constraint for faceId', async () => {
      await expect(
        prisma.attendance.create({
          data: {
            faceId: 'non-existent-face-id',
            similarity: 0.95,
            latencyMs: 120,
            model: 'face-api'
          }
        })
      ).rejects.toThrow();
    });

    test('should validate similarity range constraints', async () => {
      // Test similarity > 1
      await expect(
        prisma.attendance.create({
          data: {
            faceId: testFace.id,
            similarity: 1.5,
            latencyMs: 120,
            model: 'face-api'
          }
        })
      ).rejects.toThrow();

      // Test negative similarity
      await expect(
        prisma.attendance.create({
          data: {
            faceId: testFace.id,
            similarity: -0.1,
            latencyMs: 120,
            model: 'face-api'
          }
        })
      ).rejects.toThrow();
    });

    test('should create multiple attendance records for same face', async () => {
      const attendance1 = await prisma.attendance.create({
        data: {
          faceId: testFace.id,
          similarity: 0.95,
          latencyMs: 120,
          model: 'face-api'
        }
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const attendance2 = await prisma.attendance.create({
        data: {
          faceId: testFace.id,
          similarity: 0.88,
          latencyMs: 95,
          model: 'face-api'
        }
      });

      expect(attendance1.id).not.toBe(attendance2.id);
      expect(attendance2.createdAt.getTime()).toBeGreaterThan(attendance1.createdAt.getTime());
    });
  });

  describe('Database Queries and Relationships', () => {
    let testUser: any;
    let testFace: any;
    let attendanceRecords: any[];

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      testFace = await prisma.knownFace.create({
        data: {
          userId: testUser.id,
          descriptor: JSON.stringify(testFaceDescriptors.valid),
          hasValidDescriptor: true,
          model: 'face-api'
        }
      });

      // Create multiple attendance records
      attendanceRecords = [];
      for (let i = 0; i < 5; i++) {
        const record = await prisma.attendance.create({
          data: {
            faceId: testFace.id,
            similarity: 0.9 - (i * 0.02),
            latencyMs: 100 + (i * 20),
            model: 'face-api',
            createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Days ago
          }
        });
        attendanceRecords.push(record);
      }
    });

    test('should fetch user with related face registration', async () => {
      const userWithFace = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          knownFace: true
        }
      });

      expect(userWithFace).toBeTruthy();
      expect(userWithFace?.knownFace).toBeTruthy();
      expect(userWithFace?.knownFace?.userId).toBe(testUser.id);
    });

    test('should fetch face with related user and attendance', async () => {
      const faceWithRelations = await prisma.knownFace.findUnique({
        where: { id: testFace.id },
        include: {
          user: true,
          attendance: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      });

      expect(faceWithRelations).toBeTruthy();
      expect(faceWithRelations?.user.id).toBe(testUser.id);
      expect(faceWithRelations?.attendance).toBeTruthy();
      expect(faceWithRelations?.attendance.length).toBeLessThanOrEqual(3);
    });

    test('should perform complex aggregation queries', async () => {
      const stats = await prisma.attendance.aggregate({
        where: { faceId: testFace.id },
        _count: { id: true },
        _avg: { similarity: true, latencyMs: true },
        _max: { similarity: true },
        _min: { similarity: true }
      });

      expect(stats._count.id).toBe(attendanceRecords.length);
      expect(stats._avg.similarity).toBeGreaterThan(0);
      expect(stats._avg.latencyMs).toBeGreaterThan(0);
      expect(stats._max.similarity).toBeLessThanOrEqual(1);
      expect(stats._min.similarity).toBeGreaterThan(0);
    });

    test('should filter attendance records by date range', async () => {
      const twoDaysAgo = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
      const yesterday = new Date(Date.now() - (1 * 24 * 60 * 60 * 1000));

      const filteredRecords = await prisma.attendance.findMany({
        where: {
          faceId: testFace.id,
          createdAt: {
            gte: twoDaysAgo,
            lte: yesterday
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(filteredRecords.length).toBeGreaterThan(0);
      filteredRecords.forEach(record => {
        expect(record.createdAt >= twoDaysAgo).toBe(true);
        expect(record.createdAt <= yesterday).toBe(true);
      });
    });

    test('should handle pagination correctly', async () => {
      const pageSize = 2;
      const page1 = await prisma.attendance.findMany({
        where: { faceId: testFace.id },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: 0
      });

      const page2 = await prisma.attendance.findMany({
        where: { faceId: testFace.id },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: pageSize
      });

      expect(page1.length).toBe(pageSize);
      expect(page2.length).toBeGreaterThan(0);
      expect(page1[0].id).not.toBe(page2[0].id);
      expect(page1[0].createdAt >= page2[0].createdAt).toBe(true);
    });

    test('should count total records for pagination', async () => {
      const totalCount = await prisma.attendance.count({
        where: { faceId: testFace.id }
      });

      expect(totalCount).toBe(attendanceRecords.length);
    });
  });

  describe('Database Transaction Handling', () => {
    test('should handle transaction rollback on error', async () => {
      const initialUserCount = await prisma.user.count();

      await expect(
        prisma.$transaction(async (tx) => {
          // Create user
          await tx.user.create({
            data: {
              id: testUsers.user.id,
              email: testUsers.user.email,
              name: testUsers.user.name,
              role: testUsers.user.role,
              supabaseId: testUsers.user.supabaseId
            }
          });

          // This should fail and rollback the transaction
          await tx.user.create({
            data: {
              id: 'another-id',
              email: testUsers.user.email, // Duplicate email
              name: 'Another Name',
              role: 'USER',
              supabaseId: 'another-supabase-id'
            }
          });
        })
      ).rejects.toThrow();

      // Verify rollback - user count should be unchanged
      const finalUserCount = await prisma.user.count();
      expect(finalUserCount).toBe(initialUserCount);
    });

    test('should commit transaction successfully', async () => {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: testUsers.user.id,
            email: testUsers.user.email,
            name: testUsers.user.name,
            role: testUsers.user.role,
            supabaseId: testUsers.user.supabaseId
          }
        });

        const knownFace = await tx.knownFace.create({
          data: {
            userId: user.id,
            descriptor: JSON.stringify(testFaceDescriptors.valid),
            hasValidDescriptor: true,
            model: 'face-api'
          }
        });

        return { user, knownFace };
      });

      expect(result.user).toBeTruthy();
      expect(result.knownFace).toBeTruthy();

      // Verify both records exist in database
      const user = await prisma.user.findUnique({ where: { id: result.user.id } });
      const face = await prisma.knownFace.findUnique({ where: { id: result.knownFace.id } });

      expect(user).toBeTruthy();
      expect(face).toBeTruthy();
    });
  });
});