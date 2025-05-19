import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  loadFaceDescriptors, 
  findBestMatch, 
  isDescriptorsLoaded 
} from '@/lib/face-matching';

// Konstanta untuk threshold (batas) pencocokan wajah
// Turunkan threshold untuk meningkatkan akurasi
const MATCH_THRESHOLD = 0.4;

// Fungsi untuk memastikan descriptor dimuat ke memori
async function ensureFaceDescriptorsLoaded() {
  if (!isDescriptorsLoaded()) {
    try {
      console.time('loading-descriptors');
      
      // Ambil semua data wajah dari database
      const knownFaces = await prisma.knownFace.findMany();
      
      // Muat ke memori
      await loadFaceDescriptors(knownFaces);
      
      console.timeEnd('loading-descriptors');
      console.log(`Loaded ${knownFaces.length} face descriptors into memory`);
    } catch (error) {
      console.error('Failed to load face descriptors:', error);
      throw new Error('Failed to initialize face recognition service');
    }
  }
}

export async function POST(request: Request) {
  try {
    // Pastikan descriptor wajah dimuat
    await ensureFaceDescriptorsLoaded();

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

    const { descriptor, latencyMs } = body;

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

    // Cari kecocokan terbaik
    const match = findBestMatch(descriptor, MATCH_THRESHOLD);
    
    if (!match) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No face match found' 
        },
        { status: 404 }
      );
    }

    try {
      // Simpan record kehadiran ke database
      await prisma.attendance.create({
        data: {
          userId: match.userId,
          similarity: match.similarity,
          latencyMs
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
        similarity: match.similarity,
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