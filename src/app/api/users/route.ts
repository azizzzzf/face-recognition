import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.knownFace.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: users
    });
    
  } catch (error) {
    console.error('Failed to get users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve users',
        users: []
      },
      { status: 500 }
    );
  }
}
