const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create some test users
    const testUsers = [
      {
        id: 'user-1',
        name: 'Ahmad Rizki',
        faceApiDescriptor: Array(128).fill(0).map(() => Math.random() * 2 - 1), // Random 128D vector
        enrollmentImages: JSON.stringify(['/images/test1.jpg']),
      },
      {
        id: 'user-2', 
        name: 'Siti Nurhaliza',
        faceApiDescriptor: Array(128).fill(0).map(() => Math.random() * 2 - 1),
        enrollmentImages: JSON.stringify(['/images/test2.jpg']),
      },
      {
        id: 'user-3',
        name: 'Budi Santoso',
        faceApiDescriptor: Array(128).fill(0).map(() => Math.random() * 2 - 1), 
        enrollmentImages: JSON.stringify(['/images/test3.jpg']),
      }
    ];

    // Create users
    for (const user of testUsers) {
      await prisma.knownFace.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create some test attendance records
    const attendanceRecords = [
      // Today's records
      {
        userId: 'user-1',
        createdAt: new Date(),
      },
      {
        userId: 'user-2', 
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      
      // Yesterday's records
      {
        userId: 'user-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: 'user-3',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 1 day 1 hour ago
      },
      
      // Week ago records
      {
        userId: 'user-2',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
      {
        userId: 'user-1',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      }
    ];

    for (const record of attendanceRecords) {
      await prisma.attendance.create({
        data: record,
      });
    }

    console.log(`✅ Created ${attendanceRecords.length} attendance records`);
    console.log('🎉 Test data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();