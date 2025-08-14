const { PrismaClient } = require('./src/generated/prisma');
const { loadFaceDescriptors, findBestMatch, calculateL2Distance, toFloat32Array } = require('./src/lib/face-matching.ts');

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
    
    console.log(`Testing with ${users.length} users`);
    
    // Load descriptors
    await loadFaceDescriptors(users);
    
    // Test same person (should be high similarity)
    console.log('\n=== TESTING SAME PERSON ===');
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const result = findBestMatch(user.faceApiDescriptor, 1.0); // No threshold limit
      if (result) {
        console.log(`${user.name} vs ${result.name}: Distance=${result.distance.toFixed(4)}, Similarity=${result.similarity.toFixed(4)}`);
      }
    }
    
    // Test cross-person similarities (should be low similarity)
    console.log('\n=== TESTING DIFFERENT PEOPLE ===');
    for (let i = 0; i < Math.min(3, users.length); i++) {
      for (let j = i + 1; j < Math.min(i + 3, users.length); j++) {
        const user1 = users[i];
        const user2 = users[j];
        
        const distance = calculateL2Distance(
          toFloat32Array(user1.faceApiDescriptor),
          toFloat32Array(user2.faceApiDescriptor)
        );
        const similarity = 1 - distance;
        
        console.log(`${user1.name} vs ${user2.name}: Distance=${distance.toFixed(4)}, Similarity=${similarity.toFixed(4)}`);
      }
    }
    
    // Test with various thresholds
    console.log('\n=== THRESHOLD ANALYSIS ===');
    const testUser = users[0];
    const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5];
    
    for (const threshold of thresholds) {
      const result = findBestMatch(testUser.faceApiDescriptor, threshold);
      console.log(`Threshold ${threshold}: ${result ? `Match ${result.name} (${result.similarity.toFixed(4)})` : 'No match'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimilarityScores();