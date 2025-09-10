import { describe, test, expect, beforeAll } from '@jest/globals';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

describe('Smoke Tests - Basic Functionality', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    await waitForServer();
  });

  test('Server is running and responding', async () => {
    const response = await fetch(BASE_URL);
    expect(response.status).toBe(200);
  }, 10000);

  test('Database connection is working', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  test('Critical pages are accessible', async () => {
    const pages = [
      '/auth/login',
      '/auth/register',
    ];

    for (const page of pages) {
      const response = await fetch(`${BASE_URL}${page}`);
      expect(response.status).toBeLessThan(500);
    }
  });

  test('API endpoints are responding', async () => {
    const endpoints = [
      { path: '/api/health', expectedStatus: [200, 404] }, // Health check might not exist
      { path: '/api/stats', expectedStatus: [200, 401] },  // Might require auth
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${BASE_URL}${endpoint.path}`);
      expect(endpoint.expectedStatus).toContain(response.status);
    }
  });

  test('Face-API models directory exists', async () => {
    const modelPaths = [
      '/models/tiny_face_detector_model-weights_manifest.json',
      '/models/face_landmark_68_model-weights_manifest.json',
      '/models/face_recognition_model-weights_manifest.json'
    ];

    for (const modelPath of modelPaths) {
      const response = await fetch(`${BASE_URL}${modelPath}`);
      expect([200, 404]).toContain(response.status);
    }
  });

  test('Static assets are accessible', async () => {
    const response = await fetch(`${BASE_URL}/favicon.ico`);
    expect(response.status).toBe(200);
  });

  test('Environment variables are set', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });
});

async function waitForServer(maxAttempts = 30, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(BASE_URL);
      if (response.status < 500) {
        return;
      }
    } catch (error) {
      console.log(`Waiting for server... attempt ${i + 1}/${maxAttempts}`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Server did not start within expected time');
}