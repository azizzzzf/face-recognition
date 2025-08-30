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
import { CameraError } from './CameraError'

interface FaceCaptureProps {
  onCaptureComplete: (images: string[]) => void
  isCapturing?: boolean
}

export function MultiAngleCapture({ onCaptureComplete, isCapturing = false }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [currentAngle, setCurrentAngle] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showInstruction, setShowInstruction] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Define the 10 different angles/poses
  const angleInstructions = [
    "Wajah menghadap lurus ke depan",           // Foto 1
    "Putar kepala sedikit ke kiri",             // Foto 2
    "Putar kepala sedikit ke kanan",            // Foto 3
    "Angkat dagu sedikit ke atas",              // Foto 4
    "Turunkan dagu sedikit ke bawah",           // Foto 5
    "Miringkan kepala ke kiri",                 // Foto 6
    "Miringkan kepala ke kanan",                // Foto 7
    "Senyum natural menghadap depan",           // Foto 8
    "Ekspresi serius menghadap depan",          // Foto 9
    "Wajah rileks menghadap depan"              // Foto 10
  ]

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
      console.error('Camera access error:', err)
      
      // More specific error messages based on error type
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Akses kamera ditolak. Mohon berikan izin akses kamera untuk melanjutkan.')
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera yang berfungsi.')
        } else if (err.name === 'NotReadableError') {
          setError('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.')
        } else if (err.name === 'OverconstrainedError') {
          setError('Kamera tidak mendukung resolusi yang diminta. Coba dengan browser berbeda.')
        } else if (err.name === 'NotSupportedError') {
          setError('Browser tidak mendukung akses kamera atau halaman tidak diakses melalui HTTPS.')
        } else {
          setError('Gagal mengakses kamera. Mohon periksa izin akses kamera dan pastikan halaman ini diakses melalui HTTPS.')
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui saat mengakses kamera.')
      }
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
    
    // Debug logging
    console.log('Capturing photo:', {
      currentAngle,
      photoNumber: capturedImages.length + 1,
      instruction: angleInstructions[currentAngle]
    })
    
    // Show instruction for current angle
    setShowInstruction(true)
    setTimeout(() => setShowInstruction(false), 3000)
    
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          
          // Capture single photo for current angle
          requestAnimationFrame(() => {
            const imageData = captureImage()
            if (imageData) {
              const newCapturedImages = [...capturedImages, imageData]
              setCapturedImages(newCapturedImages)
              
              if (newCapturedImages.length >= 10) {
                // All 10 angles captured, complete the process
                setTimeout(() => {
                  stopCamera()
                  onCaptureComplete(newCapturedImages)
                }, 100)
              } else {
                // Move to next angle
                setCurrentAngle(prev => prev + 1)
              }
            }
          })
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [captureImage, stopCamera, onCaptureComplete, isCapturing, countdown, capturedImages, currentAngle])

  const resetCapture = useCallback(() => {
    // Reset all states for multi-angle capture
    setCapturedImages([])
    setCurrentAngle(0)
    setCountdown(0)
    setError(null)
    setShowInstruction(false)
    setRetryCount(0)
    
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
  const isComplete = useMemo(() => capturedImages.length >= 10, [capturedImages])
  
  const canShowControls = useMemo(() => {
    return !isComplete && isStreaming && countdown === 0
  }, [isComplete, isStreaming, countdown])
  
  const shouldShowResetButton = useMemo(() => {
    return capturedImages.length > 0 || !isStreaming
  }, [capturedImages, isStreaming])

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Enhanced Error Display */}
      {error && (
        <CameraError 
          error={error}
          retryCount={retryCount}
          onRetry={() => {
            setError(null);
            setRetryCount(prev => prev + 1);
            // Add slight delay before retrying to give user feedback
            setTimeout(() => {
              startCamera();
            }, 300);
          }}
          onDismiss={() => {
            setError(null);
            setRetryCount(0);
          }}
        />
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

        {/* Progress indicator and angle instruction */}
        {!isComplete && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-center">
              <div className="text-sm font-medium mb-1">
                Foto {capturedImages.length + 1} dari 10
              </div>
              <div className="text-xs text-gray-300">
                {angleInstructions[currentAngle]}
              </div>
            </div>
          </div>
        )}

        {/* Angle instruction overlay */}
        {showInstruction && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
            <div className="text-center text-white p-6 bg-black/80 rounded-xl max-w-sm">
              <div className="text-lg font-bold mb-2">Foto {capturedImages.length + 1} dari 10</div>
              <div className="text-base mb-4">{angleInstructions[currentAngle]}</div>
              <div className="text-sm text-gray-300">Bersiaplah untuk foto dalam 3 detik</div>
            </div>
          </div>
        )}
        
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
        {isComplete && capturedImages.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
            <div className="text-center text-white p-6">
              <div className="mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                  <Check className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold mb-2">10 Foto berhasil diambil!</p>
                <p className="text-gray-300 text-sm lg:text-base">Semua angle wajah telah tersimpan dengan baik</p>
              </div>
              <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
                {capturedImages.slice(0, 10).map((image, index) => (
                  <div key={index} className="aspect-square rounded overflow-hidden border-2 border-green-400">
                    <Image
                      src={image}
                      alt={`Angle ${index + 1}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
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
              <span>
                {capturedImages.length === 0 ? 'Ambil Foto Pertama' : `Ambil Foto ${capturedImages.length + 1}/10`}
              </span>
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
              <span>{capturedImages.length > 0 ? 'Mulai Ulang' : 'Mulai Kamera'}</span>
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
