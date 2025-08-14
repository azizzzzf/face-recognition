// Test the face matching logic directly
const { PrismaClient } = require('./src/generated/prisma');

// Import the actual functions
const { loadFaceDescriptors, findBestMatch, isDescriptorsLoaded, resetDescriptors } = require('./src/lib/face-matching.ts');

async function testAPIDirectly() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Face-API logic directly...\n');
    
    // Reset and load descriptors
    resetDescriptors();
    
    const users = await prisma.knownFace.findMany();
    const validFaces = users.filter(face => 
      face.faceApiDescriptor && Array.isArray(face.faceApiDescriptor) && face.faceApiDescriptor.length === 128
    );
    
    console.log(`Loading ${validFaces.length} valid faces into memory...`);
    await loadFaceDescriptors(validFaces);
    
    // Test 1: Same person (should match)
    console.log('\n🔍 TEST 1: Same person (should MATCH)');
    const user1 = validFaces[0];
    console.log(`Testing ${user1.name} against their own descriptor...`);
    
    const match1 = findBestMatch(user1.faceApiDescriptor, 0.10);
    if (match1) {
      console.log(`✅ MATCH: ${match1.name}`);
      console.log(`   Distance: ${match1.distance.toFixed(6)}`);
      console.log(`   Similarity: ${match1.similarity.toFixed(6)} (${(match1.similarity * 100).toFixed(2)}%)`);
    } else {
      console.log(`❌ NO MATCH (this is wrong!)`);
    }
    
    // Test 2: Different person (should NOT match)
    console.log('\n🔍 TEST 2: Different person (should NOT match)');
    const user2 = validFaces[1];
    console.log(`Testing ${user1.name} against ${user2.name} descriptor...`);
    
    const match2 = findBestMatch(user1.faceApiDescriptor, 0.10);
    if (match2) {
      console.log(`❌ FALSE MATCH: ${match2.name} (this is the problem!)`);
      console.log(`   Distance: ${match2.distance.toFixed(6)}`);
      console.log(`   Similarity: ${match2.similarity.toFixed(6)} (${(match2.similarity * 100).toFixed(2)}%)`);
      console.log(`   🚨 This should NOT match because threshold is 0.10 and similarity < 0.90`);
    } else {
      console.log(`✅ NO MATCH (correct)`);
    }
    
    // Test 3: Manual threshold testing
    console.log('\n🔍 TEST 3: Manual threshold testing');
    console.log('Testing different thresholds to see where matching stops...');
    
    const testDescriptor = user1.faceApiDescriptor;
    const thresholds = [1.0, 0.5, 0.3, 0.2, 0.15, 0.10, 0.05, 0.01];
    
    for (const threshold of thresholds) {
      const match = findBestMatch(testDescriptor, threshold);
      if (match) {
        console.log(`   Threshold ${threshold}: MATCH with ${match.name} (similarity: ${(match.similarity * 100).toFixed(2)}%)`);
      } else {
        console.log(`   Threshold ${threshold}: NO MATCH`);
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