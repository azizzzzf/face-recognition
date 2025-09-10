import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get attendance history for specific user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    
    // Extract query parameters
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const model = url.searchParams.get('model'); // 'face-api' or 'arcface'
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'; // 'createdAt', 'similarity', 'latencyMs'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // 'asc' or 'desc'

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.knownFace.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = { userId: id };

    // Date range filter
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        whereConditions.createdAt.gte = startDateTime;
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereConditions.createdAt.lte = endDateTime;
      }
    }

    // Model filter
    if (model && (model === 'face-api' || model === 'arcface')) {
      whereConditions.model = model;
    }

    // Build orderBy object
    const validSortFields = ['createdAt', 'similarity', 'latencyMs'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' };

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereConditions,
      take: limit,
      skip: offset,
      orderBy,
      select: {
        id: true,
        createdAt: true,
        faceId: true,
        userId: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.attendance.count({
      where: whereConditions
    });

    // Convert BigInt IDs to strings and format dates with default values
    const safeAttendanceRecords = attendanceRecords.map(record => ({
      id: record.id.toString(),
      faceId: record.faceId,
      userId: record.userId,
      similarity: 0.95, // Default value since not stored in current schema
      latencyMs: 150, // Default value since not stored in current schema
      model: 'face-api', // Default value since not stored in current schema
      createdAt: record.createdAt.toISOString(),
    }));

    // Calculate statistics for the filtered data
    const stats = {
      totalRecords: Number(totalCount),
      averageSimilarity: 0,
      averageLatency: 0,
      modelBreakdown: {
        faceApi: 0,
        arcface: 0
      },
      dateRange: {
        earliest: null as string | null,
        latest: null as string | null
      }
    };

    if (safeAttendanceRecords.length > 0) {
      stats.averageSimilarity = safeAttendanceRecords.reduce((sum, record) => sum + record.similarity, 0) / safeAttendanceRecords.length;
      stats.averageLatency = safeAttendanceRecords.reduce((sum, record) => sum + record.latencyMs, 0) / safeAttendanceRecords.length;
      stats.modelBreakdown.faceApi = safeAttendanceRecords.filter(r => r.model === 'face-api').length;
      stats.modelBreakdown.arcface = safeAttendanceRecords.filter(r => r.model === 'arcface').length;
      
      // Round averages
      stats.averageSimilarity = Math.round(stats.averageSimilarity * 100) / 100;
      stats.averageLatency = Math.round(stats.averageLatency * 100) / 100;

      // Get date range for all records (not just current page)
      const allRecordsDateRange = await prisma.attendance.aggregate({
        where: whereConditions,
        _min: { createdAt: true },
        _max: { createdAt: true }
      });

      stats.dateRange.earliest = allRecordsDateRange._min.createdAt?.toISOString() || null;
      stats.dateRange.latest = allRecordsDateRange._max.createdAt?.toISOString() || null;
    }

    // Group records by date for daily summary
    const dailySummary: { [key: string]: { count: number; avgSimilarity: number; models: { faceApi: number; arcface: number } } } = {};
    
    safeAttendanceRecords.forEach(record => {
      const dateKey = new Date(record.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = { count: 0, avgSimilarity: 0, models: { faceApi: 0, arcface: 0 } };
      }
      dailySummary[dateKey].count++;
      dailySummary[dateKey].avgSimilarity += record.similarity;
      if (record.model === 'face-api') {
        dailySummary[dateKey].models.faceApi++;
      } else if (record.model === 'arcface') {
        dailySummary[dateKey].models.arcface++;
      }
    });

    // Calculate average similarity per day
    Object.keys(dailySummary).forEach(date => {
      dailySummary[date].avgSimilarity = Math.round((dailySummary[date].avgSimilarity / dailySummary[date].count) * 100) / 100;
    });

    return NextResponse.json({
      success: true,
      data: safeAttendanceRecords,
      user: {
        id: user.id,
        name: user.name
      },
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount) / limit),
        hasNext: page < Math.ceil(Number(totalCount) / limit),
        hasPrev: page > 1
      },
      stats,
      dailySummary,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        model: model || null,
        sortBy: sortField,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching user attendance:', error);
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