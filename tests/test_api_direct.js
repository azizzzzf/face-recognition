// Test the face matching logic directly
const { PrismaClient } = require('../src/generated/prisma');

// Import the actual functions
const { loadFaceDescriptors, findBestMatch, isDescriptorsLoaded, resetDescriptors } = require('../src/lib/face-matching.ts');

async function testAPIDirectly() {
  const prisma = new PrismaClient();
  
  try {
    
    // Reset and load descriptors
    resetDescriptors();
    
    const users = await prisma.knownFace.findMany();
    const validFaces = users.filter(face => 
      face.faceApiDescriptor && Array.isArray(face.faceApiDescriptor) && face.faceApiDescriptor.length === 128
    );
    
    await loadFaceDescriptors(validFaces);
    
    // Test 1: Same person (should match)
    const user1 = validFaces[0];
    
    const match1 = findBestMatch(user1.faceApiDescriptor, 0.10);
    if (match1) {
    } else {
    }
    
    // Test 2: Different person (should NOT match)
    const user2 = validFaces[1];
    
    const match2 = findBestMatch(user1.faceApiDescriptor, 0.10);
    if (match2) {
    } else {
    }
    
    // Test 3: Manual threshold testing
    
    const testDescriptor = user1.faceApiDescriptor;
    const thresholds = [1.0, 0.5, 0.3, 0.2, 0.15, 0.10, 0.05, 0.01];
    
    for (const threshold of thresholds) {
      const match = findBestMatch(testDescriptor, threshold);
      if (match) {
      } else {
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIDirectly();