import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get system-wide statistics for dashboard
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const includeHourly = url.searchParams.get('includeHourly') === 'true';
    const includeModelComparison = url.searchParams.get('includeModelComparison') === 'true';

    const periodDays = Math.min(parseInt(period, 10), 365); // Max 1 year
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalAttendanceRecords,
      todayAttendanceCount,
      arcfaceEnabledUsers,
      faceApiEnabledUsers,
      usersWithBothDescriptors,
      periodAttendanceRecords,
      avgEnrollmentImages,
      modelUsageStats,
      dailyAttendanceStats
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

      // Users with ArcFace descriptors
      prisma.knownFace.count({
        where: {
          arcfaceDescriptor: { 
            not: null,
            // Check if array is not empty
            isEmpty: false 
          }
        }
      }),

      // Users with Face-API descriptors
      prisma.knownFace.count({
        where: {
          faceApiDescriptor: { not: null },
          AND: [
            { faceApiDescriptor: { not: [] } }
          ]
        }
      }),

      // Users with both descriptors
      prisma.knownFace.count({
        where: {
          AND: [
            { arcfaceDescriptor: { not: null } },
            { arcfaceDescriptor: { not: [] } },
            { faceApiDescriptor: { not: null } },
            { faceApiDescriptor: { not: [] } }
          ]
        }
      }),

      // Period attendance records with details
      prisma.attendance.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          similarity: true,
          latencyMs: true,
          model: true,
          createdAt: true,
          userId: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Average enrollment images per user
      prisma.$queryRaw<{ avg: number }[]>`
        SELECT AVG(
          CASE 
            WHEN "enrollmentImages" IS NOT NULL 
            THEN json_array_length("enrollmentImages"::json) 
            ELSE 0 
          END
        )::float as avg
        FROM "KnownFace"
      `,

      // Model usage statistics
      prisma.attendance.groupBy({
        by: ['model'],
        _count: { model: true },
        _avg: { similarity: true, latencyMs: true }
      }),

      // Daily attendance statistics for the period
      prisma.$queryRaw<Array<{ date: string; count: number; face_api_count: number; arcface_count: number }>>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::int as count,
          SUM(CASE WHEN "model" = 'face-api' THEN 1 ELSE 0 END)::int as face_api_count,
          SUM(CASE WHEN "model" = 'arcface' THEN 1 ELSE 0 END)::int as arcface_count
        FROM "Attendance"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `
    ]);

    // Calculate performance metrics
    let avgSimilarity = 0;
    let avgLatency = 0;
    let uniqueUsersInPeriod = 0;
    let peakHourData: { [hour: string]: number } = {};

    if (periodAttendanceRecords.length > 0) {
      avgSimilarity = periodAttendanceRecords.reduce((sum, record) => sum + record.similarity, 0) / periodAttendanceRecords.length;
      avgLatency = periodAttendanceRecords.reduce((sum, record) => sum + record.latencyMs, 0) / periodAttendanceRecords.length;
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

    // Model comparison data
    let modelComparison = {};
    if (includeModelComparison) {
      modelComparison = {
        faceApi: {
          count: periodAttendanceRecords.filter(r => r.model === 'face-api').length,
          avgSimilarity: 0,
          avgLatency: 0
        },
        arcface: {
          count: periodAttendanceRecords.filter(r => r.model === 'arcface').length,
          avgSimilarity: 0,
          avgLatency: 0
        }
      };

      const faceApiRecords = periodAttendanceRecords.filter(r => r.model === 'face-api');
      const arcfaceRecords = periodAttendanceRecords.filter(r => r.model === 'arcface');

      if (faceApiRecords.length > 0) {
        (modelComparison as any).faceApi.avgSimilarity = faceApiRecords.reduce((sum, r) => sum + r.similarity, 0) / faceApiRecords.length;
        (modelComparison as any).faceApi.avgLatency = faceApiRecords.reduce((sum, r) => sum + r.latencyMs, 0) / faceApiRecords.length;
      }

      if (arcfaceRecords.length > 0) {
        (modelComparison as any).arcface.avgSimilarity = arcfaceRecords.reduce((sum, r) => sum + r.similarity, 0) / arcfaceRecords.length;
        (modelComparison as any).arcface.avgLatency = arcfaceRecords.reduce((sum, r) => sum + r.latencyMs, 0) / arcfaceRecords.length;
      }
    }

    // Top performers (users with most attendance in period)
    const userAttendanceCount: { [userId: string]: number } = {};
    periodAttendanceRecords.forEach(record => {
      userAttendanceCount[record.userId] = (userAttendanceCount[record.userId] || 0) + 1;
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

    // Build response
    const stats = {
      overview: {
        totalUsers: Number(totalUsers),
        totalAttendanceRecords: Number(totalAttendanceRecords),
        todayAttendanceCount: Number(todayAttendanceCount),
        uniqueUsersInPeriod: Number(uniqueUsersInPeriod),
        periodDays: periodDays
      },
      userDistribution: {
        arcfaceEnabled: Number(arcfaceEnabledUsers),
        faceApiEnabled: Number(faceApiEnabledUsers),
        bothDescriptors: Number(usersWithBothDescriptors),
        onlyArcface: Number(arcfaceEnabledUsers) - Number(usersWithBothDescriptors),
        onlyFaceApi: Number(faceApiEnabledUsers) - Number(usersWithBothDescriptors),
        noDescriptors: Number(totalUsers) - Number(arcfaceEnabledUsers) - Number(faceApiEnabledUsers) + Number(usersWithBothDescriptors),
        avgEnrollmentImages: avgEnrollmentImages.length > 0 ? Math.round((avgEnrollmentImages[0]?.avg || 0) * 100) / 100 : 0
      },
      performance: {
        avgSimilarity: Math.round(avgSimilarity * 100) / 100,
        avgLatency: Math.round(avgLatency * 100) / 100,
        periodAttendanceCount: periodAttendanceRecords.length,
        attendanceGrowthRate: totalAttendanceRecords > 0 
          ? Math.round((periodAttendanceRecords.length / Number(totalAttendanceRecords)) * 100 * 100) / 100 
          : 0
      },
      dailyBreakdown: dailyAttendanceStats.map(day => ({
        date: day.date,
        totalAttendance: Number(day.count),
        faceApiCount: Number(day.face_api_count),
        arcfaceCount: Number(day.arcface_count)
      })),
      topPerformers: topPerformers,
      modelUsage: modelUsageStats.map(stat => ({
        model: stat.model,
        count: stat._count.model,
        avgSimilarity: Math.round((stat._avg.similarity || 0) * 100) / 100,
        avgLatency: Math.round((stat._avg.latencyMs || 0) * 100) / 100
      })),
      ...(includeHourly && { hourlyDistribution: peakHourData }),
      ...(includeModelComparison && { modelComparison })
    };

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString(),
        periodStart: startDate.toISOString(),
        periodEnd: new Date().toISOString(),
        includes: {
          hourlyData: includeHourly,
          modelComparison: includeModelComparison
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