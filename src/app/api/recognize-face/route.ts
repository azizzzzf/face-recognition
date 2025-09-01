import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  loadFaceDescriptors, 
  findBestMatch, 
  isDescriptorsLoaded 
} from '@/lib/face-matching';
import { updateSession } from '@/lib/supabase/middleware';
import { getUserBySupabaseId } from '@/lib/auth';

// Konstanta untuk threshold (batas) pencocokan wajah - threshold yang lebih realistis
const MATCH_THRESHOLD = 0.6; // Distance threshold: match jika distance < 0.6 (lebih permissive)
const SIMILARITY_THRESHOLD = 0.75; // Similarity threshold: accept jika similarity > 75%

// Fungsi untuk memastikan descriptor dimuat ke memori
async function ensureFaceDescriptorsLoaded() {
  if (!isDescriptorsLoaded()) {
    try {
      console.time('loading-descriptors');
      
      // Ambil semua data wajah dari database
      const knownFaces = await prisma.knownFace.findMany();
      
      // Filter faces yang memiliki Face-API descriptor yang valid
      // Convert Float[] from database to number[] for processing
      const validFaces = knownFaces
        .filter(face => 
          face.faceApiDescriptor && 
          Array.isArray(face.faceApiDescriptor) && 
          face.faceApiDescriptor.length === 128
        )
        .map(face => ({
          ...face,
          faceApiDescriptor: face.faceApiDescriptor.map(val => Number(val)) // Ensure number type
        }));
      
      
      if (validFaces.length === 0) {
        console.warn('No users with valid Face-API descriptors found!');
        throw new Error('No users with valid Face-API descriptors. Please register users with face-api.js first.');
      }
      
      // Muat ke memori
      await loadFaceDescriptors(validFaces);
      
      console.timeEnd('loading-descriptors');
      console.log(`Successfully loaded ${validFaces.length} face descriptors to memory`);
    } catch (error) {
      console.error('Failed to load face descriptors:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user: supabaseUser } = await updateSession(request);
    if (!supabaseUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const appUser = await getUserBySupabaseId(supabaseUser.id);
    if (!appUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

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
    let requestText;
    try {
      // Baca request sebagai text terlebih dahulu
      requestText = await request.text();
    } catch (error) {
      console.error('Failed to read request body:', error);
      return NextResponse.json(
        { error: 'Failed to read request body' },
        { status: 400 }
      );
    }

    // Parse body JSON setelah mengambil text
    let body;
    try {
      body = JSON.parse(requestText);
    } catch (error) {
      console.error('Invalid JSON in request body:', error, 'Raw request text:', requestText);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON body', 
          details: 'The request body is not valid JSON'
        },
        { status: 400 }
      );
    }
    
    if (!body) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Empty request body' 
        },
        { status: 400 }
      );
    }

    const { descriptor } = body;

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

    // Remove latency validation since we no longer track it

    // Cari kecocokan terbaik dengan threshold yang realistis
    console.log(`Starting face matching with descriptor length: ${descriptor.length}`);
    const match = findBestMatch(descriptor, MATCH_THRESHOLD);
    
    if (!match) {
      console.log('No face match found with current threshold');
      return NextResponse.json(
        { 
          success: false,
          error: 'Wajah tidak terdaftar dalam sistem. Pastikan wajah sudah didaftarkan terlebih dahulu.',
          debug: {
            descriptorLength: descriptor.length,
            threshold: MATCH_THRESHOLD
          }
        },
        { status: 404 }
      );
    }
    
    console.log(`Face match found: ${match.name} with similarity ${(match.similarity * 100).toFixed(1)}% (distance: ${match.distance.toFixed(4)})`);
    
    // Realistic threshold validation - accept reasonable similarity scores
    if (match.similarity < SIMILARITY_THRESHOLD) {
      console.warn(`Low confidence match detected: ${match.similarity.toFixed(4)} (${(match.similarity * 100).toFixed(1)}%) for user ${match.name}. Required: ${(SIMILARITY_THRESHOLD * 100).toFixed(1)}%`);
      return NextResponse.json({
        success: false,
        error: `Kecocokan wajah terlalu rendah (${(match.similarity * 100).toFixed(1)}%). Silakan posisikan wajah dengan jelas dan coba lagi.`,
        debug: {
          similarity: match.similarity,
          distance: match.distance,
          threshold: SIMILARITY_THRESHOLD
        }
      }, { status: 404 });
    }

    try {
      // Simpan record kehadiran ke database
      // For face recognition, we record the attendance of the recognized face
      await prisma.attendance.create({
        data: {
          faceId: match.userId, // The matched face ID (KnownFace)
          userId: appUser.id    // The authenticated user who performed the attendance
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save attendance record' 
        },
        { status: 500 }
      );
    }

    // Kembalikan data kecocokan dengan format yang konsisten
    return NextResponse.json({
      success: true,
      match: {
        userId: match.userId,
        name: match.name,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error recognizing face:', error);
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