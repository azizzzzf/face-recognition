import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateSession } from '@/lib/supabase/middleware';
import { getUserBySupabaseId } from '@/lib/auth';

interface PersonalAttendanceRecord {
  id: string;
  timestamp: string;
  method: 'face-recognition';
  faceId: string;
  faceName: string;
}

interface PersonalAttendanceStats {
  totalRecords: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  lastAttendance?: string;
  attendanceFrequency: {
    date: string;
    count: number;
  }[];
}

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

    // Parse query parameters
    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate + 'T23:59:59.999Z') })
        }
      };
    }

    // Get user's known faces to filter attendance
    const userKnownFaces = await prisma.knownFace.findMany({
      where: { userId: appUser.id },
      select: { id: true }
    });

    const knownFaceIds = userKnownFaces.map(face => face.id);

    if (knownFaceIds.length === 0) {
      // User has no registered faces, return empty data
      return NextResponse.json({
        success: true,
        data: {
          records: [],
          stats: {
            totalRecords: 0,
            thisMonth: 0,
            thisWeek: 0,
            today: 0,
            attendanceFrequency: []
          },
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        }
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.attendance.count({
      where: {
        faceId: { in: knownFaceIds },
        ...dateFilter
      }
    });

    // Get paginated attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        faceId: { in: knownFaceIds },
        ...dateFilter
      },
      include: {
        face: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount] = await Promise.all([
      prisma.attendance.count({
        where: {
          faceId: { in: knownFaceIds },
          createdAt: { gte: today }
        }
      }),
      prisma.attendance.count({
        where: {
          faceId: { in: knownFaceIds },
          createdAt: { gte: thisWeek }
        }
      }),
      prisma.attendance.count({
        where: {
          faceId: { in: knownFaceIds },
          createdAt: { gte: thisMonth }
        }
      })
    ]);

    // Get attendance frequency for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const frequencyData = await prisma.attendance.findMany({
      where: {
        faceId: { in: knownFaceIds },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date for frequency chart
    const frequencyMap = new Map<string, number>();
    frequencyData.forEach(record => {
      const date = record.createdAt.toISOString().split('T')[0];
      frequencyMap.set(date, (frequencyMap.get(date) || 0) + 1);
    });

    const attendanceFrequency = Array.from(frequencyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Transform records
    const records: PersonalAttendanceRecord[] = attendanceRecords.map(record => ({
      id: record.id.toString(),
      timestamp: record.createdAt.toISOString(),
      method: 'face-recognition',
      faceId: record.faceId,
      faceName: record.face.name
    }));

    const stats: PersonalAttendanceStats = {
      totalRecords: totalCount,
      thisMonth: monthCount,
      thisWeek: weekCount,
      today: todayCount,
      lastAttendance: records.length > 0 ? records[0].timestamp : undefined,
      attendanceFrequency
    };

    console.log(`Personal attendance data for ${appUser.name}:`, {
      totalRecords: totalCount,
      thisMonth: monthCount,
      thisWeek: weekCount,
      today: todayCount,
      knownFaceIds: knownFaceIds.length
    });

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching personal attendance data:', error);
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