import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  loadFaceDescriptors, 
  findBestMatch, 
  isDescriptorsLoaded 
} from '@/lib/face-matching';

// Konstanta untuk threshold (batas) pencocokan wajah - berdasarkan analisis data
const MATCH_THRESHOLD = 0.10; // Distance threshold: hanya match jika distance < 0.10

// Fungsi untuk memastikan descriptor dimuat ke memori
async function ensureFaceDescriptorsLoaded() {
  if (!isDescriptorsLoaded()) {
    try {
      console.time('loading-descriptors');
      
      // Ambil semua data wajah dari database
      const knownFaces = await prisma.knownFace.findMany();
      
      // Filter faces yang memiliki Face-API descriptor yang valid
      const validFaces = knownFaces.filter(face => 
        face.faceApiDescriptor && Array.isArray(face.faceApiDescriptor) && face.faceApiDescriptor.length === 128
      );
      
      
      if (validFaces.length === 0) {
        console.warn('No users with valid Face-API descriptors found!');
        throw new Error('No users with valid Face-API descriptors. Please register users with face-api.js first.');
      }
      
      // Muat ke memori
      await loadFaceDescriptors(validFaces);
      
      console.timeEnd('loading-descriptors');
    } catch (error) {
      console.error('Failed to load face descriptors:', error);
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    // Pastikan descriptor wajah dimuat
    try {
      await ensureFaceDescriptorsLoaded();
    } catch (descriptorError) {
      console.error('Face descriptor loading failed:', descriptorError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Face recognition service not available',
          details: descriptorError instanceof Error ? descriptorError.message : 'Failed to load face descriptors',
          suggestion: 'Please register users with valid face descriptors first'
        },
        { status: 503 }
      );
    }

    // Validasi request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Empty request body' 
        },
        { status: 400 }
      );
    }

    const { descriptor, latencyMs, excludeUserId } = body;

    // Validasi descriptor
    if (!Array.isArray(descriptor)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Descriptor must be an array' 
        },
        { status: 400 }
      );
    }
    
    // Validasi ukuran descriptor
    if (descriptor.length !== 128) {
      return NextResponse.json({
        success: false,
        error: 'Invalid descriptor format - expected 128 values'
      }, { status: 400 });
    }

    // Validasi latency
    if (typeof latencyMs !== 'number' || isNaN(latencyMs)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Latency must be a number' 
        },
        { status: 400 }
      );
    }

    // Cari kecocokan terbaik dengan threshold yang diperketat
    // Exclude specified user for benchmark testing (avoid self-matching)
    const match = findBestMatch(descriptor, MATCH_THRESHOLD, excludeUserId);
    
    if (!match) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No face match found' 
        },
        { status: 404 }
      );
    }
    
    // Ketat threshold validation - hanya accept similarity tinggi
    if (match.similarity < 0.90) {
      return NextResponse.json({
        success: false,
        error: 'Face match confidence too low'
      }, { status: 404 });
    }

    // NOTE: This is a benchmark endpoint - we DON'T save attendance records
    // Only return the match result for benchmark comparison

    // Kembalikan data kecocokan dengan format yang konsisten
    return NextResponse.json({
      success: true,
      match: {
        userId: match.userId,
        name: match.name,
        similarity: match.similarity,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in benchmark recognition:', error);
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
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}