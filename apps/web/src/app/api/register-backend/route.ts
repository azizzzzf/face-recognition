import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    console.log('Register-backend received request:', {
      name: body.name,
      hasFaceApiDescriptor: !!body.face_api_descriptor,
      faceApiDescriptorLength: body.face_api_descriptor?.length,
      hasImages: !!body.images,
      imagesCount: body.images?.length
    });

    // Prepare data for Python API
    const pythonApiData = {
      name: body.name,
      enrollment_images: body.images, // Python API expects this field name
      face_api_descriptor: body.face_api_descriptor
    };

    // Call Python API at localhost:8000
    const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const pythonResponse = await fetch(`${pythonApiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonApiData),
    });

    const pythonResult = await pythonResponse.json();
    
    console.log('Python API Response:', {
      status: pythonResponse.status,
      ok: pythonResponse.ok,
      result: pythonResult
    });

    if (!pythonResponse.ok) {
      console.error('Python API Error:', pythonResult);
      return NextResponse.json(
        { 
          error: 'Backend registration failed',
          details: pythonResult.detail || pythonResult.error || 'Unknown error'
        },
        { status: pythonResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User registered with ArcFace backend successfully',
      backendResult: pythonResult
    }, { status: 201 });

  } catch (error) {
    console.error('Error calling backend API:', error);
    
    // Check if it's a network error (Python API not running)
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Backend service unavailable',
          details: 'Python API server is not running or not accessible'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handler untuk method selain POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}