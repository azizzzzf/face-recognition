'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as faceapi from '@vladmandic/face-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Zap, Clock, Target, TrendingUp, Users } from 'lucide-react'
import { BenchmarkTable } from '@/components/BenchmarkTable'

interface User {
  id: string
  name: string
}

interface BenchmarkResult {
  model: 'face-api' | 'arcface'
  accuracy: number
  latency: number
  isMatch: boolean
  userName?: string
  userId?: string
  error?: string
  _metadata?: {
    testMode?: string
    foundMatch?: boolean
    matchedUser?: string
    selectedUser?: string
    isCorrectUser?: boolean
    crossPersonDetection?: boolean
  }
}

interface ComparisonResult {
  user: User
  faceApi?: BenchmarkResult
  arcface?: BenchmarkResult
  testImage: string
}

export function FaceBenchmark() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRunning, setBenchmarkRunning] = useState(false)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [currentResult, setCurrentResult] = useState<ComparisonResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [testMode, setTestMode] = useState<'normal' | 'cross-person'>('normal')
  const [benchmarkRefreshTrigger, setBenchmarkRefreshTrigger] = useState(0)

  // Load models and initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load face-api.js models
        const MODEL_URL = '/models'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        
        setIsModelLoaded(true)
        
        // Load users
        await loadUsers()
        
        // Start camera
        await startCamera()
        
      } catch (error) {
        console.error('Initialization error:', error)
        setError('Failed to initialize. Please reload the page.')
      }
    }

    initialize()
    return () => stopCamera()
  }, [])

  const loadUsers = async () => {
    try {
      setBackendStatus('checking')
      // Try to load from backend first
      const response = await fetch('http://localhost:8000/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setBackendStatus('online')
        return
      }
    } catch (error) {
      console.warn('Backend not available, trying local API:', error)
    }

    // Fallback to local database via Next.js API
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setBackendStatus('offline')
      } else {
        setError('No users found. Please register faces first.')
        setBackendStatus('offline')
      }
    } catch (error) {
      console.error('Failed to load users from both backend and local API:', error)
      setError('Unable to connect to user database. Please check if the backend is running.')
      setBackendStatus('offline')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Camera error:', error)
      setError('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const testFaceApi = async (imageData: string): Promise<BenchmarkResult | null> => {
    const startTime = performance.now()
    let extractionLatency = 0
    
    try {
      // Convert base64 to image
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageData
      })

      // Extract descriptor using face-api.js
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        console.warn('No face detected in image')
        return null
      }

      extractionLatency = performance.now() - startTime

      // Convert descriptor to array
      const descriptorArray = Array.from(detection.descriptor)

      // Test recognition via benchmark API (doesn't save attendance)
      const response = await fetch('/api/benchmark-recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          descriptor: descriptorArray,
          latencyMs: extractionLatency,
          excludeUserId: testMode === 'cross-person' ? selectedUser?.id : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Recognition API error:', errorData)
        
        // Return error result instead of throwing
        return {
          model: 'face-api',
          accuracy: 0,
          latency: performance.now() - startTime,
          isMatch: false,
          error: response.status === 503 
            ? `Service unavailable: ${errorData.details || errorData.error}` 
            : response.status === 404 
            ? 'No matching face found' 
            : `Recognition failed: ${errorData.error || 'Unknown error'}`
        }
      }

      const result = await response.json()

      // Return formatted result with context-aware match validation
      const foundMatch = result.success && result.match !== undefined;
      const matchedCorrectUser = result.match?.name === selectedUser?.name;
      
      // In normal mode: match is valid if we found someone AND it's the expected user
      // In cross-person mode: any valid match is acceptable (testing different people)
      let isValidMatch;
      if (testMode === 'normal') {
        isValidMatch = foundMatch && matchedCorrectUser;
      } else {
        // In cross-person mode, any match above threshold is valid
        isValidMatch = foundMatch;
      }
      
      return {
        model: 'face-api',
        accuracy: result.match?.similarity || 0,
        latency: extractionLatency,
        isMatch: isValidMatch,
        userName: result.match?.name,
        userId: result.match?.userId,
        // Add metadata for better UI feedback
        _metadata: {
          testMode,
          foundMatch,
          matchedUser: result.match?.name,
          selectedUser: selectedUser?.name,
          isCorrectUser: matchedCorrectUser,
          crossPersonDetection: testMode === 'normal' && foundMatch && !matchedCorrectUser
        }
      }

    } catch (error) {
      console.error('Face-api test error:', error)
      extractionLatency = performance.now() - startTime
      
      // Don't throw "Failed to save attendance record" error
      // The real error is already logged above
      return {
        model: 'face-api',
        accuracy: 0,
        latency: extractionLatency,
        isMatch: false,
        error: error instanceof Error ? error.message : 'Face-API test failed'
      }
    }
  }

  const testArcFace = async (imageData: string): Promise<BenchmarkResult | null> => {
    try {
      if (!selectedUser?.id) {
        console.warn('No user selected for ArcFace test')
        return null
      }

      // First, try running the benchmark
      let response = await fetch('http://localhost:8000/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          test_image: imageData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ArcFace API error:', errorData)
        throw new Error(errorData.detail || 'ArcFace test failed')
      }

      let result = await response.json()
      
      // If no ArcFace result, user might not have ArcFace descriptor
      if (!result.arcface_result) {
        console.log('No ArcFace result - attempting to complete user registration...')
        
        // Try to complete user registration with ArcFace descriptor
        try {
          const completeResponse = await fetch(`http://localhost:8000/complete-user-registration/${selectedUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: imageData
            })
          })
          
          if (completeResponse.ok) {
            console.log('User registration completed with ArcFace descriptor')
            
            // Retry the benchmark after completing registration
            response = await fetch('http://localhost:8000/benchmark', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: selectedUser.id,
                test_image: imageData
              })
            })
            
            if (response.ok) {
              result = await response.json()
            }
          } else {
            console.warn('Failed to complete user registration')
          }
        } catch (regError) {
          console.warn('Error completing registration:', regError)
        }
      }
      
      if (result.arcface_result) {
        return {
          model: 'arcface',
          accuracy: result.arcface_result.accuracy,
          latency: result.arcface_result.latency_ms,
          isMatch: result.arcface_result.is_match,
          userName: result.user_name,
          userId: result.user_id
        }
      }

      console.warn('No ArcFace result in response after all attempts:', result)
      return null
    } catch (error) {
      console.error('ArcFace test error (backend not available):', error)
      // Return null to indicate ArcFace is not available
      return null
    }
  }

  const runSingleTest = async (model: 'face-api' | 'arcface') => {
    if (!selectedUser || !isStreaming) {
      setError('Please select a user and ensure camera is active')
      return
    }

    setBenchmarkRunning(true)
    setError(null)

    try {
      const imageData = captureImage()
      if (!imageData) {
        throw new Error('Failed to capture image')
      }

      let result: BenchmarkResult | null = null

      if (model === 'face-api') {
        result = await testFaceApi(imageData)
      } else {
        result = await testArcFace(imageData)
      }

      if (result) {
        const comparisonResult: ComparisonResult = {
          user: selectedUser,
          testImage: imageData,
          [model === 'face-api' ? 'faceApi' : 'arcface']: result
        }
        
        // Save benchmark result to database (not attendance)
        await saveBenchmarkResult(comparisonResult)
        
        setCurrentResult(comparisonResult)
        setResults(prev => [comparisonResult, ...prev.slice(0, 9)]) // Keep last 10 results
      } else {
        setError(`${model} test failed`)
      }

    } catch (error) {
      console.error('Test error:', error)
      setError(error instanceof Error ? error.message : 'Test failed')
    } finally {
      setBenchmarkRunning(false)
    }
  }

  const saveBenchmarkResult = async (result: ComparisonResult) => {
    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: result.user.id,
          faceApiAccuracy: result.faceApi?.accuracy,
          faceApiLatency: result.faceApi?.latency,
          arcfaceAccuracy: result.arcface?.accuracy,
          arcfaceLatency: result.arcface?.latency,
          testImage: result.testImage
        })
      })
      
      if (response.ok) {
        // Trigger refresh of benchmark table
        setBenchmarkRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.warn('Failed to save benchmark result to database:', error)
    }
  }

  const runComparisonTest = async () => {
    if (!selectedUser || !isStreaming) {
      setError('Please select a user and ensure camera is active')
      return
    }

    setBenchmarkRunning(true)
    setError(null)

    try {
      const imageData = captureImage()
      if (!imageData) {
        throw new Error('Failed to capture image')
      }

      // Run both tests in parallel
      const [faceApiResult, arcfaceResult] = await Promise.all([
        testFaceApi(imageData),
        testArcFace(imageData)
      ])

      const comparisonResult: ComparisonResult = {
        user: selectedUser,
        testImage: imageData,
        faceApi: faceApiResult || undefined,
        arcface: arcfaceResult || undefined
      }

      // Save benchmark result to database (not attendance)
      await saveBenchmarkResult(comparisonResult)

      setCurrentResult(comparisonResult)
      setResults(prev => [comparisonResult, ...prev.slice(0, 9)]) // Keep last 10 results

    } catch (error) {
      console.error('Comparison test error:', error)
      setError(error instanceof Error ? error.message : 'Comparison test failed')
    } finally {
      setBenchmarkRunning(false)
    }
  }

  const formatLatency = (latency: number) => `${latency.toFixed(2)}ms`
  const formatAccuracy = (accuracy: number) => {
    // Convert decimal (0-1) to percentage for consistent display
    const percentage = accuracy > 1 ? accuracy : accuracy * 100
    return `${percentage.toFixed(1)}%`
  }

  if (!isModelLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Face Recognition Benchmark
          </CardTitle>
          <CardDescription>
            Compare Face-api.js vs ArcFace performance in real-time
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select User for Testing
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-green-500' : 
                  backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-muted-foreground">
                  Backend: {backendStatus === 'online' ? 'Online' : 
                          backendStatus === 'offline' ? 'Offline' : 'Checking...'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map(user => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? 'default' : 'outline'}
                  onClick={() => setSelectedUser(user)}
                  size="sm"
                >
                  {user.name}
                </Button>
              ))}
            </div>
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No registered users found. Please register faces first.
              </p>
            )}
          </div>

          {/* Camera Feed and Controls */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Live Camera Feed
              </h3>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                  muted
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <p className="text-white">Camera not active</p>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Controls</h3>
              
              {/* Test Mode Selection */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Test Mode:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTestMode('normal')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      testMode === 'normal' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    Normal Mode
                  </button>
                  <button
                    onClick={() => setTestMode('cross-person')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      testMode === 'cross-person' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    Cross-Person Test
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {testMode === 'normal' 
                    ? 'Tests against all users including selected user' 
                    : 'Excludes selected user to test cross-person accuracy'
                  }
                </p>
              </div>
              
              <div className="grid gap-3">
                <Button
                  onClick={() => runSingleTest('face-api')}
                  disabled={!selectedUser || !isStreaming || isRunning}
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Test Face-api.js Only
                </Button>
                
                <Button
                  onClick={() => runSingleTest('arcface')}
                  disabled={!selectedUser || !isStreaming || isRunning || backendStatus !== 'online'}
                  className="w-full"
                  variant="outline"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Test ArcFace Only
                  {backendStatus !== 'online' && (
                    <span className="ml-2 text-xs opacity-60">(Backend Required)</span>
                  )}
                </Button>
                
                <Button
                  onClick={runComparisonTest}
                  disabled={!selectedUser || !isStreaming || isRunning}
                  className="w-full"
                  size="lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running Benchmark...' : 'Run Comparison Benchmark'}
                  {backendStatus !== 'online' && (
                    <span className="ml-2 text-xs opacity-60">(Face-api.js only)</span>
                  )}
                </Button>
              </div>

              {selectedUser && (
                <p className="text-sm text-muted-foreground text-center">
                  Testing against: <strong>{selectedUser.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Current Result */}
          {currentResult && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Latest Test Result</CardTitle>
                <CardDescription>User: {currentResult.user.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentResult.faceApi && (
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Face-api.js</h4>
                      {currentResult.faceApi.error ? (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          <strong>Error:</strong> {currentResult.faceApi.error}
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <Badge variant={currentResult.faceApi.isMatch ? 'default' : 'secondary'}>
                              {formatAccuracy(currentResult.faceApi.accuracy)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Latency:</span>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatLatency(currentResult.faceApi.latency)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Match:</span>
                            <Badge variant={currentResult.faceApi.isMatch ? 'default' : 'destructive'}>
                              {currentResult.faceApi.isMatch ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          {currentResult.faceApi.isMatch && currentResult.faceApi.userName && (
                            <div className="flex justify-between">
                              <span>Matched User:</span>
                              <Badge variant="outline" className="text-xs">
                                {currentResult.faceApi.userName}
                              </Badge>
                            </div>
                          )}
                          {currentResult.faceApi._metadata?.crossPersonDetection && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                              🚨 <strong>False Positive Detected:</strong> Face-API matched with {currentResult.faceApi.userName}, but you selected {selectedUser?.name}. 
                              The camera may be showing a different person, or there&apos;s a recognition error.
                            </div>
                          )}
                          {currentResult.faceApi._metadata?.testMode === 'cross-person' && currentResult.faceApi.isMatch && (
                            <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                              ✅ <strong>Cross-Person Test:</strong> Successfully identified {currentResult.faceApi.userName} 
                              (excluded {selectedUser?.name} from matching).
                            </div>
                          )}
                          {!currentResult.faceApi.isMatch && currentResult.faceApi._metadata?.foundMatch && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                              ℹ️ <strong>Different Person:</strong> Detected {currentResult.faceApi.userName}, but testing against {selectedUser?.name}. 
                              Marked as &quot;No Match&quot; in {currentResult.faceApi._metadata?.testMode} mode.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {currentResult.arcface && (
                    <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">ArcFace</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <Badge variant={currentResult.arcface.isMatch ? 'default' : 'secondary'}>
                            {formatAccuracy(currentResult.arcface.accuracy)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatLatency(currentResult.arcface.latency)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Match:</span>
                          <Badge variant={currentResult.arcface.isMatch ? 'default' : 'destructive'}>
                            {currentResult.arcface.isMatch ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Statistics */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Statistics
                </CardTitle>
                <CardDescription>Aggregate performance across all tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Face-api.js Stats */}
                  {results.some(r => r.faceApi) && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Face-api.js Performance
                      </h4>
                      
                      {(() => {
                        const faceApiResults = results.filter(r => r.faceApi).map(r => r.faceApi!)
                        const avgAccuracy = faceApiResults.reduce((sum, r) => sum + r.accuracy, 0) / faceApiResults.length
                        const avgLatency = faceApiResults.reduce((sum, r) => sum + r.latency, 0) / faceApiResults.length
                        const successRate = (faceApiResults.filter(r => r.isMatch).length / faceApiResults.length) * 100
                        
                        return (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-blue-700 font-medium">Avg Accuracy</p>
                              <p className="text-xl font-bold text-blue-900">{formatAccuracy(avgAccuracy)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-700 font-medium">Avg Latency</p>
                              <p className="text-xl font-bold text-blue-900">{formatLatency(avgLatency)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-700 font-medium">Success Rate</p>
                              <p className="text-xl font-bold text-blue-900">{successRate.toFixed(1)}%</p>
                            </div>
                            <div className="col-span-3 text-center text-xs text-blue-600">
                              Based on {faceApiResults.length} test{faceApiResults.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* ArcFace Stats */}
                  {results.some(r => r.arcface) && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        ArcFace Performance
                      </h4>
                      
                      {(() => {
                        const arcfaceResults = results.filter(r => r.arcface).map(r => r.arcface!)
                        const avgAccuracy = arcfaceResults.reduce((sum, r) => sum + r.accuracy, 0) / arcfaceResults.length
                        const avgLatency = arcfaceResults.reduce((sum, r) => sum + r.latency, 0) / arcfaceResults.length
                        const successRate = (arcfaceResults.filter(r => r.isMatch).length / arcfaceResults.length) * 100
                        
                        return (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-green-700 font-medium">Avg Accuracy</p>
                              <p className="text-xl font-bold text-green-900">{formatAccuracy(avgAccuracy)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-green-700 font-medium">Avg Latency</p>
                              <p className="text-xl font-bold text-green-900">{formatLatency(avgLatency)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-green-700 font-medium">Success Rate</p>
                              <p className="text-xl font-bold text-green-900">{successRate.toFixed(1)}%</p>
                            </div>
                            <div className="col-span-3 text-center text-xs text-green-600">
                              Based on {arcfaceResults.length} test{arcfaceResults.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results History */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>Last {Math.min(results.length, 5)} benchmark tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={result.testImage}
                          alt="Test"
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{result.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Test #{results.length - index}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-sm">
                        {result.faceApi && (
                          <div className="text-center">
                            <p className="font-medium text-blue-600">Face-api.js</p>
                            <p>{formatAccuracy(result.faceApi.accuracy)} • {formatLatency(result.faceApi.latency)}</p>
                            <Badge variant={result.faceApi.isMatch ? 'default' : 'secondary'} className="text-xs mt-1">
                              {result.faceApi.isMatch ? 'Match' : 'No Match'}
                            </Badge>
                          </div>
                        )}
                        {result.arcface && (
                          <div className="text-center">
                            <p className="font-medium text-green-600">ArcFace</p>
                            <p>{formatAccuracy(result.arcface.accuracy)} • {formatLatency(result.arcface.latency)}</p>
                            <Badge variant={result.arcface.isMatch ? 'default' : 'secondary'} className="text-xs mt-1">
                              {result.arcface.isMatch ? 'Match' : 'No Match'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprehensive Benchmark History Table */}
          <BenchmarkTable refreshTrigger={benchmarkRefreshTrigger} />
        </CardContent>
      </Card>
    </div>
  )
}
