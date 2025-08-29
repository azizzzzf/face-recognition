const { default: fetch } = require('node-fetch');

// Generate mock descriptor with 128 values
const generateDescriptor = (length = 128) => {
  return Array.from({ length }, () => Math.random() * 2 - 1);
};

// Generate mock images
const generateImages = (count = 10) => {
  return Array.from({ length: count }, (_, i) => `data:image/jpeg;base64,mockImage${i}`);
};

async function testAPI() {
  const API_URL = 'http://localhost:3000/api/register-face';
  
  console.log('🧪 Testing Face Registration API...\n');

  // Test 1: Valid Registration
  console.log('📝 Test 1: Valid 128D descriptor registration');
  try {
    const validData = {
      name: 'Test User Valid',
      descriptor: generateDescriptor(128),
      enrollmentImages: generateImages(10),
      multiAngle: true
    };

    console.log('Sending request with:', {
      name: validData.name,
      descriptorLength: validData.descriptor.length,
      descriptorType: typeof validData.descriptor,
      isArray: Array.isArray(validData.descriptor),
      imagesCount: validData.enrollmentImages.length,
      multiAngle: validData.multiAngle
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData)
    });

    const result = await response.json();
    
    console.log('✅ Response:', {
      status: response.status,
      statusText: response.statusText,
      result: result
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Invalid descriptor length
  console.log('📝 Test 2: Invalid descriptor length');
  try {
    const invalidData = {
      name: 'Test User Invalid Length',
      descriptor: generateDescriptor(64), // Wrong length
      enrollmentImages: generateImages(3),
      multiAngle: true
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    console.log('✅ Expected error response:', {
      status: response.status,
      result: result
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Missing name
  console.log('📝 Test 3: Missing name field');
  try {
    const invalidData = {
      descriptor: generateDescriptor(128),
      enrollmentImages: generateImages(3),
      multiAngle: true
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    console.log('✅ Expected error response:', {
      status: response.status,
      result: result
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Invalid descriptor type
  console.log('📝 Test 4: Invalid descriptor type');
  try {
    const invalidData = {
      name: 'Test User Invalid Type',
      descriptor: 'invalid-descriptor',
      enrollmentImages: generateImages(3),
      multiAngle: true
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    console.log('✅ Expected error response:', {
      status: response.status,
      result: result
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
}

// Run the test
testAPI().catch(console.error);