import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { TestHelpers } from '@/tests/utils/testHelpers';
import { testUsers } from '@/tests/fixtures/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication API Integration Tests', () => {
  beforeEach(async () => {
    await TestHelpers.cleanupTestData();
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    test('should login user with valid credentials', async () => {
      // First create user in database
      await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUsers.user.email,
          password: testUsers.user.password
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(testUsers.user.email);
      expect(data.data.session).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid credentials');
    });

    test('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: ''
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@test.com',
          password: 'NewUserPass123!',
          name: 'New Test User'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('newuser@test.com');
      expect(data.data.user.name).toBe('New Test User');
      expect(data.data.user.role).toBe('USER');

      // Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { email: 'newuser@test.com' }
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser?.name).toBe('New Test User');
    });

    test('should reject duplicate email registration', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          id: testUsers.user.id,
          email: testUsers.user.email,
          name: testUsers.user.name,
          role: testUsers.user.role,
          supabaseId: testUsers.user.supabaseId
        }
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testUsers.user.email,
          password: 'AnotherPass123!',
          name: 'Another User'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    test('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'ValidPass123!',
          name: 'Test User'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    test('should validate password requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          name: 'Test User'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('password');
    });

    test('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com'
          // Missing password and name
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});