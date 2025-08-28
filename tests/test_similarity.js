const { PrismaClient } = require('../src/generated/prisma');
const { loadFaceDescriptors, findBestMatch, calculateL2Distance, toFloat32Array } = require('../src/lib/face-matching.ts');

async function testSimilarityScores() {
  const prisma = new PrismaClient();
  
  try {
    // Load all users
    const users = await prisma.knownFace.findMany({
      where: {
        faceApiDescriptor: {
          not: null
        }
      }
    });
    
    
    // Load descriptors
    await loadFaceDescriptors(users);
    
    // Test same person (should be high similarity)
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const result = findBestMatch(user.faceApiDescriptor, 1.0); // No threshold limit
      if (result) {
      }
    }
    
    // Test cross-person similarities (should be low similarity)
    for (let i = 0; i < Math.min(3, users.length); i++) {
      for (let j = i + 1; j < Math.min(i + 3, users.length); j++) {
        const user1 = users[i];
        const user2 = users[j];
        
        const distance = calculateL2Distance(
          toFloat32Array(user1.faceApiDescriptor),
          toFloat32Array(user2.faceApiDescriptor)
        );
        const similarity = 1 - distance;
        
      }
    }
    
    // Test with various thresholds
    const testUser = users[0];
    const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5];
    
    for (const threshold of thresholds) {
      const result = findBestMatch(testUser.faceApiDescriptor, threshold);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimilarityScores();