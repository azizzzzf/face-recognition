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

    // Only admins can access user management
    if (appUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Extract query parameters for filtering
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim();
    const status = url.searchParams.get('status'); // 'arcface', 'face-api', or 'both'
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    
    // Build where conditions for users
    const whereConditions: Record<string, unknown> = {};
    
    // Search by name filter
    if (search) {
      whereConditions.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    const users = await prisma.knownFace.findMany({
      where: whereConditions,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        faceApiDescriptor: true,
        enrollmentImages: true,
        createdAt: true,
        Attendance: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          where: startDate || endDate ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          } : undefined
        },
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate stats for each user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredUsers = users.map((user) => {
      const attendanceCount = user.Attendance.length;
      const lastAttendance = user.Attendance[0]?.createdAt || null;
      const todayAttendance = user.Attendance.filter(
        (att) => att.createdAt >= today
      ).length;

      // Parse enrollment images to count them
      let enrollmentImageCount = 0;
      try {
        const images = JSON.parse(user.enrollmentImages as string);
        enrollmentImageCount = Array.isArray(images) ? images.length : 0;
      } catch {
        enrollmentImageCount = 0;
      }

      const hasFaceApi = user.faceApiDescriptor && user.faceApiDescriptor.length > 0;

      return {
        id: user.id,
        name: user.name,
        faceApiDescriptor: user.faceApiDescriptor,
        enrollmentImages: user.enrollmentImages,
        attendanceCount,
        lastAttendance,
        todayAttendance,
        enrollmentImageCount,
        hasFaceApi,
        createdAt: user.createdAt,
        registrationDate: user.Attendance.length > 0 
          ? user.Attendance[user.Attendance.length - 1]?.createdAt 
          : null,
      };
    });

    // Apply status filter after processing
    if (status) {
      filteredUsers = filteredUsers.filter(user => {
        switch (status) {
          case 'face-api':
            return user.hasFaceApi;
          default:
            return true;
        }
      });
    }

    // Get total count for pagination (before status filtering)
    const totalUserCount = await prisma.knownFace.count({
      where: whereConditions
    });

    // Calculate system-wide stats based on filtered users
    const totalUsers = filteredUsers.length;
    
    // Calculate users registered today based on createdAt
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const usersRegisteredToday = await prisma.knownFace.count({
      where: {
        ...whereConditions,
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });


    return NextResponse.json({
      success: true,
      data: filteredUsers,
      pagination: {
        total: totalUserCount,
        page,
        limit,
        totalPages: Math.ceil(totalUserCount / limit),
        hasNext: page < Math.ceil(totalUserCount / limit),
        hasPrev: page > 1
      },
      stats: {
        totalUsers: totalUserCount,
        filteredUsers: totalUsers,
        usersRegisteredToday,
      },
      filters: {
        search: search || null,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
    
  } catch (error) {
    console.error('Failed to get users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve users',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        stats: {
          totalUsers: 0,
          filteredUsers: 0,
          usersRegisteredToday: 0,
        },
        filters: {
          search: null,
          status: null,
          startDate: null,
          endDate: null
        }
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for user management
export async function DELETE(request: NextRequest) {
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

    // Only admins can delete users
    if (appUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const userIds = searchParams.get('ids')?.split(',');

    if (!userId && !userIds) {
      return NextResponse.json(
        { success: false, error: 'User ID or IDs required' },
        { status: 400 }
      );
    }

    if (userId) {
      // Delete single user
      await prisma.knownFace.delete({
        where: { id: userId },
      });
    } else if (userIds) {
      // Bulk delete users
      await prisma.knownFace.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${userId ? '1 user' : `${userIds?.length} users`}`,
    });
    
  } catch (error) {
    console.error('Failed to delete user(s):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user(s)' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating user information
export async function PUT(request: NextRequest) {
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

    // Only admins can update user information
    if (appUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'User ID and name required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.knownFace.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
    
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
