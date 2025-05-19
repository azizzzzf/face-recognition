import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipe data untuk struktur objek generik
type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Fungsi untuk mengkonversi data dengan BigInt menjadi format JSON yang aman
function convertBigIntToString(data: unknown): JsonValue {
  // Jika data adalah array, konversi setiap item
  if (Array.isArray(data)) {
    return data.map(item => convertBigIntToString(item));
  }
  
  // Jika data adalah object, konversi setiap property
  if (data !== null && typeof data === 'object') {
    const result: Record<string, JsonValue> = {};
    
    for (const key in data) {
      // Skip prototype properties
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      
      const value = (data as Record<string, unknown>)[key];
      
      // Handle BigInt
      if (typeof value === 'bigint') {
        result[key] = value.toString();
      } 
      // Handle Date objects
      else if (value instanceof Date) {
        result[key] = value.toISOString();
      }
      // Recursively process nested objects and arrays
      else {
        result[key] = convertBigIntToString(value);
      }
    }
    
    return result;
  }
  
  // Convert BigInt primitives directly
  if (typeof data === 'bigint') {
    return data.toString();
  }
  
  // Return primitives as is (string, number, boolean, null)
  return data as JsonValue;
}

// Fungsi untuk memproses data log kehadiran untuk memastikan format konsisten
function processAttendanceLogs(logs: Record<string, any>[]): Record<string, any>[] {
  return logs.map(log => {
    // Pastikan createdAt selalu dalam format ISO string
    if (log.createdAt instanceof Date) {
      log.createdAt = log.createdAt.toISOString();
    } else if (typeof log.createdAt === 'string') {
      try {
        // Coba validasi format tanggal dan konversi
        const date = new Date(log.createdAt);
        if (!isNaN(date.getTime())) {
          log.createdAt = date.toISOString();
        }
      } catch (error) {
        console.warn('Invalid date format:', log.createdAt, error);
      }
    }
    return log;
  });
}

// Handler untuk GET request
export async function GET(request: Request) {
  try {
    // Ambil URL dan parameter query
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    
    // Hitung offset untuk paginasi
    const offset = (page - 1) * limit;
    
    // Ambil data kehadiran terbaru dengan relasi ke data pengguna
    const attendanceLogs = await prisma.attendance.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Proses data untuk memastikan format tanggal konsisten
    const processedLogs = processAttendanceLogs(attendanceLogs);
    
    // Konversi BigInt sebelum serialisasi JSON
    const safeAttendanceLogs = convertBigIntToString(processedLogs);
    
    console.log('Processed logs:', JSON.stringify(safeAttendanceLogs).substring(0, 200) + '...');
    
    // Hitung total data untuk paginasi
    const totalCount = await prisma.attendance.count();
    
    // Format respon dengan informasi paginasi
    const response = {
      success: true,
      data: safeAttendanceLogs,
      pagination: {
        total: Number(totalCount), // Pastikan ini juga dikonversi jika BigInt
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount) / limit)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
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

// Untuk Method lain selain GET
export async function POST() {
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