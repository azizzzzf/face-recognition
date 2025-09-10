import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export class TestHelpers {
  static async createTestSession(user: TestUser) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) throw error;
    return data.session;
  }

  static async makeAuthenticatedRequest(
    url: string,
    options: any = {},
    session?: any
  ) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (session) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  static generateMockFaceDescriptor(): number[] {
    return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
  }

  static generateMockImage(): string {
    // Base64 encoded 1x1 pixel PNG
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 5000,
    intervalMs: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`);
  }

  static async cleanupTestData() {
    await prisma.attendance.deleteMany({});
    await prisma.knownFace.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
  }

  static mockFaceApiModel() {
    // Mock face-api.js model loading
    return {
      detectSingleFace: jest.fn().mockResolvedValue({
        descriptor: new Float32Array(this.generateMockFaceDescriptor())
      }),
      nets: {
        tinyFaceDetector: {
          loadFromUri: jest.fn().mockResolvedValue(true)
        },
        faceLandmark68Net: {
          loadFromUri: jest.fn().mockResolvedValue(true)
        },
        faceRecognitionNet: {
          loadFromUri: jest.fn().mockResolvedValue(true)
        }
      }
    };
  }

  static async createTestAttendance(userId: string, faceId?: string) {
    return await prisma.attendance.create({
      data: {
        faceId: faceId || 'test-face-id',
        similarity: 0.85,
        latencyMs: 150,
        model: 'face-api'
      }
    });
  }

  static validateResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    return response.json();
  }

  static formatTestResults(results: any[]) {
    return results.map(result => ({
      testName: result.name,
      status: result.status === 'passed' ? 'Berhasil' : 'Tidak Berhasil',
      duration: result.duration,
      error: result.error?.message
    }));
  }
}