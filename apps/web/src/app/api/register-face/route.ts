import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    console.log('Received registration request:', {
      name: body.name,
      hasDescriptor: !!body.descriptor,
      descriptorLength: body.descriptor?.length,
      hasEnrollmentImages: !!body.enrollmentImages,
      enrollmentImagesCount: body.enrollmentImages?.length,
      userId: body.userId,
      multiAngle: body.multiAngle,
      hasArcfaceDescriptor: !!body.arcfaceDescriptor
    });

    const { name, descriptor, userId, multiAngle = false, arcfaceDescriptor, enrollmentImages } = body;

    // Validasi nama
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validasi descriptor
    if (!Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: 'Descriptor must be an array' },
        { status: 400 }
      );
    }

    // Validasi panjang descriptor (harus 128 atau 512 angka)
    if (descriptor.length !== 128 && descriptor.length !== 512) {
      return NextResponse.json(
        { error: 'Descriptor must be exactly 128 or 512 numbers' },
        { status: 400 }
      );
    }

    // Validasi semua nilai descriptor adalah angka
    if (!descriptor.every((val) => typeof val === 'number')) {
      return NextResponse.json(
        { error: 'All descriptor values must be numbers' },
        { status: 400 }
      );
    }
    // Handle existing user with ID (for multi-angle registration)
    if (userId) {
      try {
        // Prepare update data
        const updateData: {
          faceApiDescriptor: number[];
          arcfaceDescriptor?: number[];
          enrollmentImages?: string;
        } = {
          faceApiDescriptor: descriptor,
        };
        
        // Add ArcFace descriptor if provided
        if (arcfaceDescriptor && Array.isArray(arcfaceDescriptor)) {
          updateData.arcfaceDescriptor = arcfaceDescriptor;
        }
        
        // Add enrollment images if provided
        if (enrollmentImages && Array.isArray(enrollmentImages)) {
          updateData.enrollmentImages = JSON.stringify(enrollmentImages);
        }
        
        // Update existing user with descriptors
        const updatedFace = await prisma.knownFace.update({
          where: { id: userId },
          data: updateData,
        });
        
        return NextResponse.json({
          ...updatedFace,
          message: `Descriptors updated for ${name}`,
          multiAngle,
          arcfaceEnabled: !!arcfaceDescriptor
        }, { status: 200 });
        
      } catch (updateError) {
        console.error('Error updating existing face:', updateError);
        // If update fails, create new record
      }
    }

    // Create new user (legacy support or new registration)
    const createData: {
      name: string;
      faceApiDescriptor: number[];
      arcfaceDescriptor: number[];
      enrollmentImages: string;
    } = {
      name,
      faceApiDescriptor: descriptor,
      arcfaceDescriptor: arcfaceDescriptor || [], // Use provided ArcFace descriptor or empty array
      enrollmentImages: enrollmentImages ? JSON.stringify(enrollmentImages) : '[]', // Use provided images or empty array
    };
    
    console.log('Creating face record with data:', {
      name: createData.name,
      faceApiDescriptorLength: createData.faceApiDescriptor.length,
      arcfaceDescriptorLength: createData.arcfaceDescriptor.length,
      enrollmentImagesLength: createData.enrollmentImages.length,
      enrollmentImagesType: typeof createData.enrollmentImages
    });
    
    const createdFace = await prisma.knownFace.create({
      data: createData,
    });

    console.log('Face record created successfully:', createdFace.id);

    // Try to get ArcFace descriptor from backend
    let arcfaceProcessed = false;
    let arcfaceResult = null;
    
    if (enrollmentImages && Array.isArray(enrollmentImages) && enrollmentImages.length > 0) {
      try {
        console.log('Attempting to process images with ArcFace backend...');
        
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            enrollment_images: enrollmentImages,
            face_api_descriptor: descriptor
          }),
        });

        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          arcfaceResult = backendResult;
          
          console.log('Backend processing result:', {
            success: backendResult.success,
            arcfaceSuccess: backendResult.arcface_success,
            arcfaceDescriptor: backendResult.arcface_descriptor ? 'present' : 'null'
          });
          
          // If ArcFace was successful, update the database record
          if (backendResult.arcface_success && backendResult.arcface_descriptor) {
            try {
              await prisma.knownFace.update({
                where: { id: createdFace.id },
                data: {
                  arcfaceDescriptor: backendResult.arcface_descriptor
                }
              });
              arcfaceProcessed = true;
              console.log('ArcFace descriptor updated successfully in database');
            } catch (updateError) {
              console.error('Failed to update ArcFace descriptor:', updateError);
            }
          }
        } else {
          console.warn('Backend processing failed:', await backendResponse.text());
        }
      } catch (backendError) {
        console.warn('Backend processing error:', backendError);
      }
    }

    return NextResponse.json({
      ...createdFace,
      message: `Face registered successfully for ${name}`,
      multiAngle,
      arcfaceEnabled: arcfaceProcessed,
      arcfaceResult: arcfaceResult
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering face:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
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

// Helper function untuk method yang tidak diperbolehkan
function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
} 