import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Global test setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

beforeAll(async () => {
  // Setup test database
  console.log('Setting up test database...');
  
  // Clear existing test data
  await clearTestData();
  
  // Seed test data
  await seedTestData();
});

afterAll(async () => {
  // Cleanup
  await clearTestData();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Reset test state before each test
});

afterEach(async () => {
  // Cleanup after each test if needed
});

async function clearTestData() {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.attendance.deleteMany({});
    await prisma.knownFace.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
  } catch (error) {
    console.error('Error clearing test data:', error);
  }
}

async function seedTestData() {
  try {
    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        id: 'test-admin-id',
        name: 'Test Admin',
        email: 'test-admin@example.com',
        role: 'ADMIN',
        supabaseId: 'test-admin-supabase-id'
      }
    });

    const regularUser = await prisma.user.create({
      data: {
        id: 'test-user-id', 
        name: 'Test User',
        email: 'test-user@example.com',
        role: 'USER',
        supabaseId: 'test-user-supabase-id'
      }
    });

    const userWithFace = await prisma.user.create({
      data: {
        id: 'test-user-face-id',
        name: 'Test User With Face',
        email: 'test-user-face@example.com',
        role: 'USER',
        supabaseId: 'test-user-face-supabase-id'
      }
    });

    // Create test face registration
    await prisma.knownFace.create({
      data: {
        id: 'test-face-id',
        name: 'Test User With Face',
        userId: userWithFace.id,
        faceApiDescriptor: Array(128).fill(0.5), // Mock descriptor
        enrollmentImages: JSON.stringify(['test-image-1.jpg', 'test-image-2.jpg']),
        multiAngle: true
      }
    });

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

// Export utilities for tests
export { prisma, supabase };
export const testUsers = {
  admin: {
    id: 'test-admin-id',
    email: 'test-admin@example.com',
    password: 'TestAdmin123!',
    name: 'Test Admin',
    role: 'ADMIN'
  },
  user: {
    id: 'test-user-id',
    email: 'test-user@example.com', 
    password: 'TestUser123!',
    name: 'Test User',
    role: 'USER'
  },
  userWithFace: {
    id: 'test-user-face-id',
    email: 'test-user-face@example.com',
    password: 'TestUserFace123!',
    name: 'Test User With Face', 
    role: 'USER'
  }
};