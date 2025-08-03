import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      faceApiAccuracy,
      faceApiLatency,
      arcfaceAccuracy,
      arcfaceLatency,
      testImage
    } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.knownFace.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Save benchmark result
    const benchmarkResult = await prisma.benchmarkResult.create({
      data: {
        userId,
        faceApiAccuracy: faceApiAccuracy || null,
        faceApiLatency: faceApiLatency || null,
        arcfaceAccuracy: arcfaceAccuracy || null,
        arcfaceLatency: arcfaceLatency || null,
        testImage: testImage || ''
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      result: benchmarkResult
    })

  } catch (error) {
    console.error('Benchmark save error:', error)
    return NextResponse.json(
      { error: 'Failed to save benchmark result' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = userId ? { userId } : {}

    const results = await prisma.benchmarkResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Calculate statistics
    const faceApiResults = results.filter(r => r.faceApiAccuracy !== null)
    const arcfaceResults = results.filter(r => r.arcfaceAccuracy !== null)

    const stats = {
      total: results.length,
      faceApi: {
        count: faceApiResults.length,
        avgAccuracy: faceApiResults.length > 0 
          ? faceApiResults.reduce((sum, r) => sum + (r.faceApiAccuracy || 0), 0) / faceApiResults.length
          : 0,
        avgLatency: faceApiResults.length > 0
          ? faceApiResults.reduce((sum, r) => sum + (r.faceApiLatency || 0), 0) / faceApiResults.length
          : 0
      },
      arcface: {
        count: arcfaceResults.length,
        avgAccuracy: arcfaceResults.length > 0
          ? arcfaceResults.reduce((sum, r) => sum + (r.arcfaceAccuracy || 0), 0) / arcfaceResults.length
          : 0,
        avgLatency: arcfaceResults.length > 0
          ? arcfaceResults.reduce((sum, r) => sum + (r.arcfaceLatency || 0), 0) / arcfaceResults.length
          : 0
      }
    }

    return NextResponse.json({
      results,
      stats
    })

  } catch (error) {
    console.error('Benchmark fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch benchmark results' },
      { status: 500 }
    )
  }
}