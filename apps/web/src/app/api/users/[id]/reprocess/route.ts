import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Re-process ArcFace descriptor for user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user with enrollment images
    const user = await prisma.knownFace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        enrollmentImages: true,
        faceApiDescriptor: true,
        arcfaceDescriptor: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse enrollment images
    let enrollmentImages = [];
    try {
      enrollmentImages = JSON.parse(user.enrollmentImages as string);
      if (!Array.isArray(enrollmentImages) || enrollmentImages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No enrollment images found for this user' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid enrollment images data' },
        { status: 400 }
      );
    }

    // Prepare data for Python API reprocessing
    const reprocessData = {
      user_id: user.id,
      name: user.name,
      enrollment_images: enrollmentImages,
      face_api_descriptor: user.faceApiDescriptor || []
    };

    console.log('Reprocessing ArcFace for user:', {
      userId: user.id,
      name: user.name,
      imagesCount: enrollmentImages.length,
      hasFaceApiDescriptor: !!user.faceApiDescriptor,
      currentArcfaceLength: user.arcfaceDescriptor?.length || 0
    });

    // Call Python API for ArcFace reprocessing
    const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const pythonResponse = await fetch(`${pythonApiUrl}/reprocess-arcface`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reprocessData),
      // Increase timeout for image processing
      signal: AbortSignal.timeout(60000) // 60 seconds timeout
    });

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}));
      console.error('Python API Error for reprocessing:', errorData);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'ArcFace reprocessing failed',
          details: errorData.detail || errorData.error || `HTTP ${pythonResponse.status}`
        },
        { status: pythonResponse.status }
      );
    }

    const pythonResult = await pythonResponse.json();
    console.log('Python API reprocessing result:', pythonResult);

    // Update user with new ArcFace descriptor if provided
    if (pythonResult.arcface_descriptor && Array.isArray(pythonResult.arcface_descriptor)) {
      const updatedUser = await prisma.knownFace.update({
        where: { id },
        data: { 
          arcfaceDescriptor: pythonResult.arcface_descriptor 
        },
        select: {
          id: true,
          name: true,
          arcfaceDescriptor: true,
          faceApiDescriptor: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'ArcFace descriptor reprocessed successfully',
        data: {
          userId: updatedUser.id,
          name: updatedUser.name,
          arcfaceDescriptorLength: updatedUser.arcfaceDescriptor?.length || 0,
          faceApiDescriptorLength: updatedUser.faceApiDescriptor?.length || 0,
          hasArcface: updatedUser.arcfaceDescriptor && updatedUser.arcfaceDescriptor.length > 0,
          hasFaceApi: updatedUser.faceApiDescriptor && updatedUser.faceApiDescriptor.length > 0
        },
        processingInfo: {
          imagesProcessed: enrollmentImages.length,
          processingTime: pythonResult.processing_time_ms || null,
          model: 'arcface'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'ArcFace processing completed but no descriptor returned',
        details: 'Python API did not return a valid ArcFace descriptor'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error reprocessing ArcFace descriptor:', error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'ArcFace reprocessing timeout',
            details: 'Processing took too long. Please try again or check if the backend service is responsive.'
          },
          { status: 408 }
        );
      }

      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Backend service unavailable',
            details: 'ArcFace processing service is not running or not accessible'
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// For other methods that are not allowed
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

// Helper function for method not allowed
function methodNotAllowed() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}