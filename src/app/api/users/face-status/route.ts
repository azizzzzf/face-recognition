import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateSession } from '@/lib/supabase/middleware';
import { getUserBySupabaseId } from '@/lib/auth';

interface FaceRegistrationStatus {
  hasAccount: boolean;
  hasFaceRegistration: boolean;
  canAccessAttendance: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  faceRegistration?: {
    id: string;
    registeredAt: string;
    hasValidDescriptor: boolean;
  };
  attendanceStats?: {
    totalRecords: number;
    lastAttendance?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { user: supabaseUser } = await updateSession(request);
    if (!supabaseUser) {
      return NextResponse.json<{ success: false; error: string }>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const appUser = await getUserBySupabaseId(supabaseUser.id);
    if (!appUser) {
      return NextResponse.json<{ success: false; error: string }>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Get user dengan face registration dan attendance data
    const userWithFaceData = await prisma.user.findUnique({
      where: { id: appUser.id },
      include: {
        knownFaces: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            faceApiDescriptor: true,
            Attendance: {
              select: {
                id: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        },
        attendances: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    });

    if (!userWithFaceData) {
      return NextResponse.json<{ success: false; error: string }>({
        success: false,
        error: 'User data not found'
      }, { status: 404 });
    }

    // Determine face registration status
    const hasFaceRegistration = userWithFaceData.knownFaces.length > 0;
    let hasValidDescriptor = false;
    let faceRegistrationData = null;
    let totalAttendanceRecords = 0;
    let lastAttendanceDate = null;

    if (hasFaceRegistration) {
      const knownFace = userWithFaceData.knownFaces[0];
      hasValidDescriptor = knownFace.faceApiDescriptor && 
                          Array.isArray(knownFace.faceApiDescriptor) && 
                          knownFace.faceApiDescriptor.length === 128;
      
      faceRegistrationData = {
        id: knownFace.id,
        registeredAt: knownFace.createdAt.toISOString(),
        hasValidDescriptor
      };

      // Get attendance stats from face-based attendance
      totalAttendanceRecords = knownFace.Attendance.length;
      if (knownFace.Attendance.length > 0) {
        lastAttendanceDate = knownFace.Attendance[0].createdAt.toISOString();
      }
    }

    // Also count user-based attendance records
    const userAttendanceCount = userWithFaceData.attendances.length;
    totalAttendanceRecords = Math.max(totalAttendanceRecords, userAttendanceCount);

    const status: FaceRegistrationStatus = {
      hasAccount: true,
      hasFaceRegistration,
      canAccessAttendance: hasFaceRegistration && hasValidDescriptor,
      user: {
        id: userWithFaceData.id,
        name: userWithFaceData.name,
        email: userWithFaceData.email,
        role: userWithFaceData.role
      },
      ...(faceRegistrationData && { faceRegistration: faceRegistrationData }),
      attendanceStats: {
        totalRecords: totalAttendanceRecords,
        ...(lastAttendanceDate && { lastAttendance: lastAttendanceDate })
      }
    };

    console.log(`Face status check for ${userWithFaceData.name}:`, {
      hasFaceRegistration,
      hasValidDescriptor,
      canAccessAttendance: status.canAccessAttendance,
      totalAttendanceRecords
    });

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking face registration status:', error);
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