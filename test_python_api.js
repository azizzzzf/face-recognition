const { default: fetch } = require('node-fetch');

// Generate mock descriptor with 128 values
const generateDescriptor = (length = 128) => {
  return Array.from({ length }, () => Math.random() * 2 - 1);
};

// Generate mock images
const generateImages = (count = 10) => {
  return Array.from({ length: count }, (_, i) => `data:image/jpeg;base64,mockImage${i}`);
};

async function testPythonAPI() {
  const API_URL = 'http://localhost:8000/register';
  
  console.log('🐍 Testing Python ArcFace Registration API...\n');

  // Test Python API directly
  console.log('📝 Test: Direct Python API registration');
  try {
    const testData = {
      name: 'Test User Python API',
      enrollment_images: generateImages(10),
      face_api_descriptor: generateDescriptor(128)
    };

    console.log('Sending request with:', {
      name: testData.name,
      enrollmentImagesCount: testData.enrollment_images.length,
      faceApiDescriptorLength: testData.face_api_descriptor.length
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
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

  // Test through Next.js backend proxy
  console.log('📝 Test: Next.js backend proxy registration');
  try {
    const testData = {
      name: 'Test User Backend Proxy',
      images: generateImages(10),
      face_api_descriptor: generateDescriptor(128)
    };

    const response = await fetch('http://localhost:3000/api/register-backend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
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

  console.log('\n🏁 Python API Testing Complete!');
}

// Run the test
testPythonAPI().catch(console.error);