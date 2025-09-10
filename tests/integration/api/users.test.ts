import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET as getUsersHandler, POST as createUserHandler } from '@/app/api/users/route';
import { GET as getUserHandler, PUT as updateUserHandler, DELETE as deleteUserHandler } from '@/app/api/users/[id]/route';
import { TestHelpers } from '@/tests/utils/testHelpers';
import { testUsers } from '@/tests/fixtures/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Users API Integration Tests', () => {
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

  describe('GET /api/users', () => {
    test('should allow admin to fetch all users', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const adminUser = data.data.find((u: any) => u.role === 'ADMIN');
      expect(adminUser).toBeTruthy();
      expect(adminUser.email).toBe(testUsers.admin.email);
    });

    test('should deny regular user access to users list', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('access');
    });

    test('should deny unauthenticated access', async () => {
      const request = new NextRequest('http://localhost:3000/api/users');

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    test('should support pagination', async () => {
      // Create additional test users
      for (let i = 0; i < 15; i++) {
        await prisma.user.create({
          data: {
            id: `test-user-${i}`,
            email: `user${i}@test.com`,
            name: `Test User ${i}`,
            role: 'USER',
            supabaseId: `test-supabase-${i}`
          }
        });
      }

      const request = new NextRequest('http://localhost:3000/api/users?limit=5&offset=0', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(5);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThan(5);
    });
  });

  describe('GET /api/users/[id]', () => {
    test('should allow admin to get specific user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testUsers.user.id);
      expect(data.data.email).toBe(testUsers.user.email);
    });

    test('should allow user to get their own data', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testUsers.user.id);
    });

    test('should deny user access to other users data', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.admin.id}`, {
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUserHandler(request, { params: { id: testUsers.admin.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    test('should return 404 for non-existent user', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/non-existent-id', {
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await getUserHandler(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/users/[id]', () => {
    test('should allow admin to update any user', async () => {
      const updateData = {
        name: 'Updated User Name',
        role: 'ADMIN'
      };

      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await updateUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
      expect(data.data.role).toBe(updateData.role);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUsers.user.id }
      });
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.role).toBe(updateData.role);
    });

    test('should allow user to update their own profile (limited fields)', async () => {
      const updateData = {
        name: 'Self Updated Name'
      };

      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await updateUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
    });

    test('should deny user from updating role', async () => {
      const updateData = {
        role: 'ADMIN'
      };

      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await updateUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    test('should validate update data', async () => {
      const updateData = {
        email: 'invalid-email-format'
      };

      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await updateUserHandler(request, { params: { id: testUsers.user.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/users/[id]', () => {
    test('should allow admin to delete user', async () => {
      const userToDelete = await prisma.user.create({
        data: {
          id: 'user-to-delete',
          email: 'delete@test.com',
          name: 'User To Delete',
          role: 'USER',
          supabaseId: 'delete-supabase-id'
        }
      });

      const request = new NextRequest(`http://localhost:3000/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await deleteUserHandler(request, { params: { id: userToDelete.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id }
      });
      expect(deletedUser).toBeNull();
    });

    test('should deny regular user from deleting users', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.admin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await deleteUserHandler(request, { params: { id: testUsers.admin.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    test('should prevent admin from deleting themselves', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUsers.admin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await deleteUserHandler(request, { params: { id: testUsers.admin.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('cannot delete yourself');
    });
  });
});