import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get simplified system-wide statistics for attendance dashboard
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const includeHourly = url.searchParams.get('includeHourly') === 'true';

    const periodDays = Math.min(parseInt(period, 10), 365); // Max 1 year
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Simplified queries for basic functionality
    const [
      totalUsers,
      totalAttendanceRecords,
      todayAttendanceCount,
      faceApiEnabledUsers,
      periodAttendanceRecords
    ] = await Promise.all([
      // Total users count
      prisma.knownFace.count(),

      // Total attendance records
      prisma.attendance.count(),

      // Today's attendance count
      prisma.attendance.count({
        where: {
          createdAt: { gte: today }
        }
      }),

      // Users with Face-API descriptors (non-empty arrays)
      prisma.knownFace.count({
        where: {
          NOT: {
            faceApiDescriptor: { isEmpty: true }
          }
        }
      }),

      // Period attendance records with details
      prisma.attendance.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          createdAt: true,
          userId: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate basic metrics
    let uniqueUsersInPeriod = 0;
    let peakHourData: { [hour: string]: number } = {};

    if (periodAttendanceRecords.length > 0) {
      uniqueUsersInPeriod = new Set(periodAttendanceRecords.map(record => record.userId)).size;

      // Calculate hourly distribution if requested
      if (includeHourly) {
        periodAttendanceRecords.forEach(record => {
          const hour = new Date(record.createdAt).getHours();
          const hourKey = `${hour}:00`;
          peakHourData[hourKey] = (peakHourData[hourKey] || 0) + 1;
        });
      }
    }

    // Remove model comparison since we only use face-api.js now

    // Top performers (users with most attendance in period)
    const userAttendanceCount: { [userId: string]: number } = {};
    periodAttendanceRecords.forEach(record => {
      if (record.userId) {
        userAttendanceCount[record.userId] = (userAttendanceCount[record.userId] || 0) + 1;
      }
    });

    const topUserIds = Object.entries(userAttendanceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);

    const topUsers = topUserIds.length > 0 ? await prisma.knownFace.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, name: true }
    }) : [];

    const topPerformers = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      attendanceCount: userAttendanceCount[user.id] || 0
    })).sort((a, b) => b.attendanceCount - a.attendanceCount);

    // Build simplified response
    const stats = {
      overview: {
        totalUsers: Number(totalUsers),
        totalAttendanceRecords: Number(totalAttendanceRecords),
        todayAttendanceCount: Number(todayAttendanceCount),
        uniqueUsersInPeriod: Number(uniqueUsersInPeriod),
        periodDays: periodDays
      },
      userDistribution: {
        faceApiEnabled: Number(faceApiEnabledUsers),
        noDescriptors: Number(totalUsers) - Number(faceApiEnabledUsers),
        avgEnrollmentImages: 0 // Simplified - can be enhanced later
      },
      performance: {
        periodAttendanceCount: periodAttendanceRecords.length,
        attendanceGrowthRate: totalAttendanceRecords > 0 
          ? Math.round((periodAttendanceRecords.length / Number(totalAttendanceRecords)) * 100 * 100) / 100 
          : 0
      },
      dailyBreakdown: [], // Simplified - can be enhanced later
      topPerformers: topPerformers,
      ...(includeHourly && { hourlyDistribution: peakHourData })
    };

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString(),
        periodStart: startDate.toISOString(),
        periodEnd: new Date().toISOString(),
        includes: {
          hourlyData: includeHourly
        }
      }
    });

  } catch (error) {
    console.error('Error fetching system statistics:', error);
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

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
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