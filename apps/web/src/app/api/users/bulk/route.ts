import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Bulk delete users by IDs
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userIds } = body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User IDs array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate that all IDs are strings
    if (!userIds.every(id => typeof id === 'string')) {
      return NextResponse.json(
        { success: false, error: 'All user IDs must be valid strings' },
        { status: 400 }
      );
    }

    // Limit bulk operations to prevent accidental mass deletions
    const maxBulkDelete = 50;
    if (userIds.length > maxBulkDelete) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Bulk delete is limited to ${maxBulkDelete} users at a time` 
        },
        { status: 400 }
      );
    }

    // Get users that exist and count their attendance records
    const existingUsers = await prisma.knownFace.findMany({
      where: { 
        id: { in: userIds } 
      },
      include: {
        _count: {
          select: { Attendance: true }
        }
      }
    });

    const foundUserIds = existingUsers.map(user => user.id);
    const notFoundUserIds = userIds.filter(id => !foundUserIds.includes(id));

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No users found with the provided IDs',
          details: { notFound: notFoundUserIds }
        },
        { status: 404 }
      );
    }

    // Calculate total attendance records that will be deleted
    const totalAttendanceRecords = existingUsers.reduce(
      (sum, user) => sum + user._count.Attendance, 
      0
    );

    // Perform bulk delete (attendance records will be cascade deleted)
    const deleteResult = await prisma.knownFace.deleteMany({
      where: {
        id: { in: foundUserIds }
      }
    });

    const deletedUserDetails = existingUsers.map(user => ({
      id: user.id,
      name: user.name,
      attendanceRecordsDeleted: user._count.Attendance
    }));

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} users and ${totalAttendanceRecords} attendance records`,
      data: {
        deletedCount: deleteResult.count,
        attendanceRecordsDeleted: totalAttendanceRecords,
        deletedUsers: deletedUserDetails,
        ...(notFoundUserIds.length > 0 && { 
          notFound: notFoundUserIds,
          notFoundCount: notFoundUserIds.length 
        })
      }
    });

  } catch (error) {
    console.error('Error bulk deleting users:', error);
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

// POST - Export user data to CSV
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userIds, 
      includeAttendance = false, 
      format = 'csv',
      startDate,
      endDate 
    } = body;

    // Validate format
    if (format !== 'csv' && format !== 'json') {
      return NextResponse.json(
        { success: false, error: 'Format must be either "csv" or "json"' },
        { status: 400 }
      );
    }

    // Build where conditions
    const whereConditions: any = {};
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      whereConditions.id = { in: userIds };
    }

    // Limit export to prevent excessive data
    const maxExportUsers = 1000;
    const userCount = await prisma.knownFace.count({ where: whereConditions });
    
    if (userCount > maxExportUsers) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Export is limited to ${maxExportUsers} users. Current query would export ${userCount} users.` 
        },
        { status: 400 }
      );
    }

    // Get users with optional attendance data
    const users = await prisma.knownFace.findMany({
      where: whereConditions,
      include: {
        Attendance: includeAttendance ? {
          select: {
            id: true,
            similarity: true,
            latencyMs: true,
            model: true,
            createdAt: true,
          },
          where: startDate || endDate ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          } : undefined,
          orderBy: { createdAt: 'desc' }
        } : false
      },
      orderBy: { name: 'asc' }
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found to export' },
        { status: 404 }
      );
    }

    // Prepare export data
    const exportData = users.map(user => {
      // Parse enrollment images
      let enrollmentImageCount = 0;
      try {
        const images = JSON.parse(user.enrollmentImages as string);
        enrollmentImageCount = Array.isArray(images) ? images.length : 0;
      } catch {
        enrollmentImageCount = 0;
      }

      const userData = {
        id: user.id,
        name: user.name,
        enrollmentImageCount,
        hasArcface: user.arcfaceDescriptor && user.arcfaceDescriptor.length > 0,
        hasFaceApi: user.faceApiDescriptor && user.faceApiDescriptor.length > 0,
        arcfaceDescriptorLength: user.arcfaceDescriptor?.length || 0,
        faceApiDescriptorLength: user.faceApiDescriptor?.length || 0,
      };

      if (includeAttendance && user.Attendance) {
        const attendanceRecords = user.Attendance.map(att => ({
          id: att.id.toString(),
          similarity: att.similarity,
          latencyMs: att.latencyMs,
          model: att.model,
          createdAt: att.createdAt.toISOString(),
        }));

        return {
          ...userData,
          attendanceCount: attendanceRecords.length,
          lastAttendance: attendanceRecords[0]?.createdAt || null,
          avgSimilarity: attendanceRecords.length > 0 
            ? Math.round((attendanceRecords.reduce((sum, att) => sum + att.similarity, 0) / attendanceRecords.length) * 100) / 100
            : null,
          avgLatency: attendanceRecords.length > 0
            ? Math.round((attendanceRecords.reduce((sum, att) => sum + att.latencyMs, 0) / attendanceRecords.length) * 100) / 100
            : null,
          ...(format === 'json' && { attendanceRecords })
        };
      }

      return userData;
    });

    if (format === 'csv') {
      // Generate CSV format
      const headers = Object.keys(exportData[0]).filter(key => key !== 'attendanceRecords');
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Handle null/undefined values and escape commas/quotes
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `users-export-${timestamp}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Return JSON format
      const timestamp = new Date().toISOString();
      return NextResponse.json({
        success: true,
        data: exportData,
        meta: {
          exportedAt: timestamp,
          totalUsers: exportData.length,
          includeAttendance,
          filters: {
            userIds: userIds || null,
            startDate: startDate || null,
            endDate: endDate || null
          }
        }
      });
    }

  } catch (error) {
    console.error('Error exporting users:', error);
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
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
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