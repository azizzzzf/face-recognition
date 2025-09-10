import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateSession } from '@/lib/supabase/middleware';
import { getUserBySupabaseId } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Only admins can access registered users list
    if (appUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all registered users dengan face registration status
    const registeredUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        knownFaces: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            faceApiDescriptor: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Transform data dengan face registration status
    const usersWithFaceStatus = registeredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      registeredAt: user.createdAt,
      hasFaceRegistration: user.knownFaces.length > 0,
      faceRegistration: user.knownFaces.length > 0 ? {
        id: user.knownFaces[0].id,
        registeredAt: user.knownFaces[0].createdAt,
        hasValidDescriptor: user.knownFaces[0].faceApiDescriptor && 
                          Array.isArray(user.knownFaces[0].faceApiDescriptor) && 
                          user.knownFaces[0].faceApiDescriptor.length === 128
      } : null
    }));

    console.log(`Found ${registeredUsers.length} registered users, ${usersWithFaceStatus.filter(u => u.hasFaceRegistration).length} with face registration`);

    return NextResponse.json({
      success: true,
      data: usersWithFaceStatus,
      summary: {
        totalUsers: usersWithFaceStatus.length,
        usersWithFaces: usersWithFaceStatus.filter(u => u.hasFaceRegistration).length,
        usersWithoutFaces: usersWithFaceStatus.filter(u => !u.hasFaceRegistration).length
      }
    });
  } catch (error) {
    console.error('Error fetching registered users:', error);
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

// Handler untuk method selain GET
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}