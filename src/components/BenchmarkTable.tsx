'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  History, 
  Clock, 
  Target, 
  User, 
  RefreshCw,
  TrendingUp,
  Zap,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface BenchmarkRecord {
  id: string
  userId: string
  faceApiAccuracy: number | null
  faceApiLatency: number | null
  arcfaceAccuracy: number | null
  arcfaceLatency: number | null
  testImage: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface BenchmarkStats {
  total: number
  faceApi: {
    count: number
    avgAccuracy: number
    avgLatency: number
  }
  arcface: {
    count: number
    avgAccuracy: number
    avgLatency: number
  }
}

interface BenchmarkTableProps {
  refreshTrigger?: number // Used to trigger refresh from parent component
}

export function BenchmarkTable({ refreshTrigger }: BenchmarkTableProps) {
  const [records, setRecords] = useState<BenchmarkRecord[]>([])
  const [stats, setStats] = useState<BenchmarkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(50) // Default to showing last 50 records

  const fetchBenchmarkHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/benchmark?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch benchmark history')
      }
      
      const data = await response.json()
      setRecords(data.results || [])
      setStats(data.stats || null)
      
    } catch (error) {
      console.error('Error fetching benchmark history:', error)
      setError(error instanceof Error ? error.message : 'Failed to load benchmark history')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchBenchmarkHistory()
  }, [limit, refreshTrigger])

  const formatAccuracy = (accuracy: number | null) => {
    if (accuracy === null) return 'N/A'
    // Convert decimal (0-1) to percentage for consistent display
    const percentage = accuracy > 1 ? accuracy : accuracy * 100
    return `${percentage.toFixed(1)}%`
  }

  const formatLatency = (latency: number | null) => {
    if (latency === null) return 'N/A'
    return `${latency.toFixed(2)}ms`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  const getAccuracyBadgeVariant = (accuracy: number | null): "default" | "secondary" | "destructive" => {
    if (accuracy === null) return 'secondary'
    const percentage = accuracy > 1 ? accuracy : accuracy * 100
    if (percentage >= 90) return 'default'
    if (percentage >= 70) return 'secondary'
    return 'destructive'
  }

  if (loading && records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Benchmark History
          </CardTitle>
          <CardDescription>Historical benchmark test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading benchmark history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Benchmark History
          </CardTitle>
          <CardDescription>Historical benchmark test results</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4" 
                onClick={fetchBenchmarkHistory}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Benchmark Statistics
            </CardTitle>
            <CardDescription>
              Performance overview across {stats.total} total tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Face-API Stats */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Face-API.js Performance
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-blue-700 font-medium">Avg Accuracy</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatAccuracy(stats.faceApi.avgAccuracy)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-700 font-medium">Avg Latency</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatLatency(stats.faceApi.avgLatency)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-700 font-medium">Test Count</p>
                    <p className="text-xl font-bold text-blue-900">{stats.faceApi.count}</p>
                  </div>
                </div>
              </div>

              {/* ArcFace Stats */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  ArcFace Performance
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-700 font-medium">Avg Accuracy</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatAccuracy(stats.arcface.avgAccuracy)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-700 font-medium">Avg Latency</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatLatency(stats.arcface.avgLatency)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-700 font-medium">Test Count</p>
                    <p className="text-xl font-bold text-green-900">{stats.arcface.count}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benchmark History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Benchmark History
              </CardTitle>
              <CardDescription>
                Detailed results from all benchmark tests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>Last 500</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBenchmarkHistory}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No benchmark history found</p>
              <p className="text-sm">Run some benchmark tests to see results here</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date & Time
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        Face-API Accuracy
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Face-API Latency
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        ArcFace Accuracy
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        ArcFace Latency
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => {
                    const datetime = formatDateTime(record.createdAt)
                    return (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">
                          <div>
                            <div className="font-medium">{datetime.date}</div>
                            <div className="text-muted-foreground">{datetime.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{record.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getAccuracyBadgeVariant(record.faceApiAccuracy)}>
                            {formatAccuracy(record.faceApiAccuracy)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {formatLatency(record.faceApiLatency)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getAccuracyBadgeVariant(record.arcfaceAccuracy)}>
                            {formatAccuracy(record.arcfaceAccuracy)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {formatLatency(record.arcfaceLatency)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}