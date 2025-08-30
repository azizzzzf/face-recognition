import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get detailed user information including photos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.knownFace.findUnique({
      where: { id },
      include: {
        Attendance: {
          select: {
            id: true,
            similarity: true,
            latencyMs: true,
            model: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse enrollment images
    let enrollmentImages = [];
    try {
      enrollmentImages = JSON.parse(user.enrollmentImages as string);
      if (!Array.isArray(enrollmentImages)) {
        enrollmentImages = [];
      }
    } catch {
      enrollmentImages = [];
    }

    // Calculate user statistics
    const attendanceCount = user.Attendance.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = user.Attendance.filter(
      (att) => att.createdAt >= today
    ).length;

    const avgSimilarity = attendanceCount > 0 
      ? user.Attendance.reduce((sum, att) => sum + att.similarity, 0) / attendanceCount 
      : 0;

    const avgLatency = attendanceCount > 0
      ? user.Attendance.reduce((sum, att) => sum + att.latencyMs, 0) / attendanceCount
      : 0;

    const modelUsage = {
      faceApi: user.Attendance.filter(att => att.model === 'face-api').length,
      arcface: user.Attendance.filter(att => att.model === 'arcface').length,
    };

    // Convert BigInt IDs to strings for JSON serialization
    const safeAttendance = user.Attendance.map(att => ({
      ...att,
      id: att.id.toString(),
      createdAt: att.createdAt.toISOString(),
    }));

    const userDetails = {
      id: user.id,
      name: user.name,
      enrollmentImages,
      enrollmentImageCount: enrollmentImages.length,
      hasArcface: user.arcfaceDescriptor && user.arcfaceDescriptor.length > 0,
      hasFaceApi: user.faceApiDescriptor && user.faceApiDescriptor.length > 0,
      arcfaceDescriptorLength: user.arcfaceDescriptor?.length || 0,
      faceApiDescriptorLength: user.faceApiDescriptor?.length || 0,
      attendance: safeAttendance,
      stats: {
        attendanceCount,
        todayAttendance,
        avgSimilarity: Math.round(avgSimilarity * 100) / 100,
        avgLatency: Math.round(avgLatency * 100) / 100,
        modelUsage,
        firstAttendance: attendanceCount > 0 ? user.Attendance[attendanceCount - 1]?.createdAt : null,
        lastAttendance: attendanceCount > 0 ? user.Attendance[0]?.createdAt : null,
      }
    };

    return NextResponse.json({
      success: true,
      data: userDetails,
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
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

// PUT - Update user information (name editing)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid name is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.knownFace.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if name is already taken by another user
    const duplicateUser = await prisma.knownFace.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { success: false, error: 'Name is already taken by another user' },
        { status: 409 }
      );
    }

    // Update user name
    const updatedUser = await prisma.knownFace.update({
      where: { id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User name updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
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

// DELETE - Delete user and cascade delete attendance records
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists and get attendance count
    const existingUser = await prisma.knownFace.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Attendance: true }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const attendanceCount = existingUser._count.Attendance;

    // Delete user (attendance records will be cascade deleted due to foreign key constraints)
    await prisma.knownFace.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `User "${existingUser.name}" and ${attendanceCount} attendance record(s) deleted successfully`,
      deletedUser: {
        id: existingUser.id,
        name: existingUser.name,
        attendanceRecordsDeleted: attendanceCount
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
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

// For other methods that are not allowed
export async function POST() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

// Helper function for method not allowed
function methodNotAllowed() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}