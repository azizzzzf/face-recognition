import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Memastikan request body adalah valid JSON
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { name, descriptor } = body;

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

    // Menyimpan data wajah ke database menggunakan Prisma
    const createdFace = await prisma.knownFace.create({
      data: {
        name,
        descriptor,
      },
    });

    // Mengembalikan response sukses
    return NextResponse.json(createdFace, { status: 201 });
  } catch (error) {
    console.error('Error registering face:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
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