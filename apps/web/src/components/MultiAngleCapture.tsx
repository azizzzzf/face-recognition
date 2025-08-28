'use client'

/**
 * Face Capture Component
 * Optimized for single high-quality face capture with responsive design
 * Features: 75vh camera view, responsive SVG circle guide, enhanced image quality
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'

interface FaceCaptureProps {
  onCaptureComplete: (images: string[]) => void
  isCapturing?: boolean
}

export function MultiAngleCapture({ onCaptureComplete, isCapturing = false }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          aspectRatio: { ideal: 16/9, min: 4/3, max: 21/9 },
          frameRate: { ideal: 30, max: 30 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Optimize video playback settings
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current
            console.log(`Camera initialized: ${videoWidth}x${videoHeight}`)
          }
        }
        
        // Optimize memory usage
        videoRef.current.onended = () => {
          setIsStreaming(false)
        }
        
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      setError('Gagal mengakses kamera. Mohon periksa izin akses kamera dan pastikan halaman ini diakses melalui HTTPS.')
      console.error('Camera access error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        track.stop()
        console.log(`Camera track stopped: ${track.kind}`)
      })
      videoRef.current.srcObject = null
      videoRef.current.load() // Reset video element
      setIsStreaming(false)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    // Capture at optimized quality for horizontal layout
    const targetWidth = Math.min(video.videoWidth, 1920)
    const targetHeight = Math.min(video.videoHeight, 1080)
    
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    // Apply image enhancement for better face detection
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.filter = 'contrast(1.1) brightness(1.05)'
    
    // Scale and center the image if needed
    const scaleX = targetWidth / video.videoWidth
    const scaleY = targetHeight / video.videoHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = video.videoWidth * scale
    const scaledHeight = video.videoHeight * scale
    const offsetX = (targetWidth - scaledWidth) / 2
    const offsetY = (targetHeight - scaledHeight) / 2
    
    // Flip the image horizontally to match the mirrored video display
    context.save()
    context.scale(-1, 1)
    context.drawImage(video, -offsetX - scaledWidth, offsetY, scaledWidth, scaledHeight)
    context.restore()
    context.filter = 'none'

    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const handleCapture = useCallback(() => {
    if (isCapturing || countdown > 0) return
    
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          
          // Capture with requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            const imageData = captureImage()
            if (imageData) {
              setCapturedImage(imageData)
              // Delay camera stop to prevent flickering
              setTimeout(() => {
                stopCamera()
                onCaptureComplete([imageData])
              }, 100)
            }
          })
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [captureImage, stopCamera, onCaptureComplete, isCapturing, countdown])

  const resetCapture = useCallback(() => {
    // Batch state updates for better performance
    setCapturedImage(null)
    setCountdown(0)
    setError(null)
    
    if (!isStreaming) {
      // Debounce camera restart to prevent multiple calls
      setTimeout(() => {
        startCamera()
      }, 150)
    }
  }, [isStreaming, startCamera])

  useEffect(() => {
    startCamera()
    
    // Cleanup function dengan capture ref value di awal effect
    const currentCanvas = canvasRef.current
    
    return () => {
      stopCamera()
      // Clear any potential memory leaks - use captured ref value
      if (currentCanvas) {
        const ctx = currentCanvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)
        }
      }
    }
  }, [startCamera, stopCamera])

  // Memoize expensive computations
  const isComplete = useMemo(() => capturedImage !== null, [capturedImage])
  
  const canShowControls = useMemo(() => {
    return !isComplete && isStreaming && countdown === 0
  }, [isComplete, isStreaming, countdown])
  
  const shouldShowResetButton = useMemo(() => {
    return capturedImage || !isStreaming
  }, [capturedImage, isStreaming])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Error notification */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 p-4 bg-red-900 bg-opacity-90 border border-red-600 rounded-lg text-red-200 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Full Screen Camera View - optimized for horizontal layout */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{
            aspectRatio: '16/9',
            objectPosition: 'center center',
            transform: 'scaleX(-1)' // Mirror the video horizontally
          }}
          autoPlay
          playsInline
          muted
        />
        
        {/* Face Position Guide Mark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Outer circle guide */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 border-2 border-white/70 rounded-full shadow-lg">
              {/* Inner circle guide */}
              <div className="absolute inset-4 border border-white/50 rounded-full">
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border border-white/60 rounded-full bg-white/20 backdrop-blur-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Corner markers */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white/60 rounded-full"></div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white/60 rounded-full"></div>
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-white/60 rounded-full"></div>
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-white/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white text-6xl sm:text-7xl lg:text-8xl font-bold mb-4 animate-pulse">
                {countdown}
              </div>
              <p className="text-white text-lg lg:text-xl font-medium">
                Bersiaplah...
              </p>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {isComplete && capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
            <div className="text-center text-white p-6">
              <div className="mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                  <Check className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold mb-2">Foto berhasil diambil!</p>
                <p className="text-gray-300 text-sm lg:text-base">Foto wajah telah tersimpan dengan baik</p>
              </div>
              <Image
                src={capturedImage}
                alt="Captured face"
                width={160}
                height={160}
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-full mx-auto border-4 border-green-400 shadow-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls section moved outside camera view */}
      <div className="p-3 md:p-4 lg:p-6 bg-white border-t border-gray-200">
        <div className="flex justify-center items-center gap-3 md:gap-4">
          {canShowControls && (
            <Button
              onClick={handleCapture}
              disabled={isCapturing || countdown > 0}
              size="lg"
              className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 h-10 md:h-12 lg:h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Camera className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2 md:mr-3" />
              <span>Ambil Foto</span>
            </Button>
          )}

          {shouldShowResetButton && (
            <Button
              onClick={resetCapture}
              variant="outline"
              disabled={isCapturing || countdown > 0}
              size="lg"
              className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 h-10 md:h-12 lg:h-14 border-2 border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2 md:mr-3" />
              <span>{capturedImage ? 'Ambil Ulang' : 'Mulai Kamera'}</span>
            </Button>
          )}
          
          {/* Error indicator */}
          {error && (
            <div className="hidden md:flex items-center text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </div>
          )}
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="hidden" 
        style={{ 
          imageRendering: '-webkit-optimize-contrast'
        }} 
      />
    </div>
  )
}
