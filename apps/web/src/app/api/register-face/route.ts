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

    // Check for existing users with the same name to prevent duplicates
    const existingUser = await prisma.knownFace.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingUser) {
      console.log('Duplicate user detected:', {
        requestedName: name,
        existingUserId: existingUser.id,
        existingUserName: existingUser.name
      });
      
      return NextResponse.json(
        { 
          error: 'User already exists',
          details: `Pengguna dengan nama "${name}" sudah terdaftar. Gunakan nama yang berbeda atau hapus pengguna yang sudah ada terlebih dahulu.`,
          existingUserId: existingUser.id
        },
        { status: 409 }
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

    // Create new user record with Face-API descriptor
    const createData: {
      name: string;
      faceApiDescriptor: number[];
      arcfaceDescriptor: number[];
      enrollmentImages: string;
    } = {
      name,
      faceApiDescriptor: descriptor,
      arcfaceDescriptor: arcfaceDescriptor || [], // Start with empty ArcFace descriptor
      enrollmentImages: enrollmentImages ? JSON.stringify(enrollmentImages) : '[]',
    };
    
    console.log('Creating face record with data:', {
      name: createData.name,
      faceApiDescriptorLength: createData.faceApiDescriptor.length,
      arcfaceDescriptorLength: createData.arcfaceDescriptor.length,
      enrollmentImagesLength: createData.enrollmentImages.length,
    });
    
    const createdFace = await prisma.knownFace.create({
      data: createData,
    });

    console.log('Face record created successfully:', createdFace.id);

    // Process ArcFace descriptor using existing user (no duplicate creation)
    let arcfaceProcessed = false;
    let arcfaceResult = null;
    
    if (enrollmentImages && Array.isArray(enrollmentImages) && enrollmentImages.length > 0) {
      try {
        console.log(`Processing ArcFace descriptor for user ${createdFace.id}...`);
        
        // Use the complete-user-registration endpoint with the first enrollment image
        const arcfaceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/complete-user-registration/${createdFace.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: enrollmentImages[0] // Use the first enrollment image for ArcFace
          }),
        });

        if (arcfaceResponse.ok) {
          const arcfaceResult = await arcfaceResponse.json();
          arcfaceProcessed = true;
          console.log('ArcFace processing successful for user:', createdFace.id);
          console.log('ArcFace result:', {
            success: arcfaceResult.success,
            hasDescriptor: !!arcfaceResult.arcface_descriptor
          });
        } else {
          const errorText = await arcfaceResponse.text();
          console.warn('ArcFace processing failed:', errorText);
        }
      } catch (backendError) {
        console.warn('ArcFace processing error (continuing without ArcFace):', backendError);
      }
    }
    
    console.log('User registered successfully with Face-API descriptor', arcfaceProcessed ? 'and ArcFace descriptor' : '(ArcFace processing failed)');

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