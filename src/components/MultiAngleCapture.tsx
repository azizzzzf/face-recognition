'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'

interface MultiAngleCaptureProps {
  onCaptureComplete: (images: string[]) => void
  isCapturing?: boolean
}

const CAPTURE_ANGLES = [
  { name: 'Front', description: 'Look straight at the camera' },
  { name: 'Left', description: 'Turn your face slightly left' },
  { name: 'Right', description: 'Turn your face slightly right' }
]

export function MultiAngleCapture({ onCaptureComplete, isCapturing = false }: MultiAngleCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
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
    } catch (err) {
      setError('Failed to access camera. Please check permissions.')
      console.error('Camera access error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  const handleCapture = useCallback(() => {
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          
          // Capture the image
          const imageData = captureImage()
          if (imageData) {
            const newImages = [...capturedImages, imageData]
            setCapturedImages(newImages)
            
            if (currentAngleIndex < CAPTURE_ANGLES.length - 1) {
              setCurrentAngleIndex(prev => prev + 1)
            }
            // Don't stop camera here - let useEffect handle completion
          }
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [captureImage, capturedImages, currentAngleIndex])

  const resetCapture = useCallback(() => {
    setCapturedImages([])
    setCurrentAngleIndex(0)
    setCountdown(0)
    if (!isStreaming) {
      startCamera()
    }
  }, [isStreaming, startCamera])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // Handle completion callback safely
  useEffect(() => {
    if (capturedImages.length === CAPTURE_ANGLES.length && capturedImages.length > 0) {
      // Stop camera when all images are captured
      stopCamera()
      // Use setTimeout to ensure this runs after current render cycle
      setTimeout(() => {
        onCaptureComplete(capturedImages)
      }, 100)
    }
  }, [capturedImages.length, onCaptureComplete, capturedImages, stopCamera])

  const currentAngle = CAPTURE_ANGLES[currentAngleIndex]
  const isComplete = capturedImages.length === CAPTURE_ANGLES.length

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Multi-Angle Face Capture
        </CardTitle>
        <CardDescription>
          Capture your face from different angles for better recognition accuracy
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-4">
          {CAPTURE_ANGLES.map((angle, index) => (
            <Badge
              key={angle.name}
              variant={
                index < capturedImages.length
                  ? 'default'
                  : index === currentAngleIndex
                  ? 'secondary'
                  : 'outline'
              }
              className="flex items-center gap-1"
            >
              {index < capturedImages.length && (
                <Check className="h-3 w-3" />
              )}
              {angle.name}
            </Badge>
          ))}
        </div>

        {/* Camera feed */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            autoPlay
            playsInline
            muted
          />
          
          {countdown > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-6xl font-bold">
                {countdown}
              </div>
            </div>
          )}

          {!isComplete && isStreaming && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg text-center">
                <div className="text-lg font-semibold mb-1">
                  {currentAngle.name} View
                </div>
                <div className="text-sm">
                  {currentAngle.description}
                </div>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isComplete && isStreaming && countdown === 0 && (
            <Button
              onClick={handleCapture}
              disabled={isCapturing}
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture {currentAngle.name} View
            </Button>
          )}

          {capturedImages.length > 0 && (
            <Button
              onClick={resetCapture}
              variant="outline"
              disabled={isCapturing}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>

        {/* Preview captured images */}
        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Captured Images:</h3>
            <div className="flex gap-2 overflow-x-auto">
              {capturedImages.map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={image}
                    alt={`Captured ${CAPTURE_ANGLES[index].name}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <p className="text-xs text-center mt-1">
                    {CAPTURE_ANGLES[index].name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              All angles captured successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
