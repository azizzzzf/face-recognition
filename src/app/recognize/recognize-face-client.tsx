'use client';

import { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { Card, CardContent } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Camera, Upload, Check, AlertCircle, CheckCircle2, Users } from 'lucide-react';

interface RecognitionResult {
  success: boolean;
  match?: {
    userId: string;
    name: string;
    similarity: number;
    timestamp: string;
    method?: string;
  };
  error?: string;
}

type RecognitionStatus = 'idle' | 'processing' | 'success' | 'error';
type CaptureMode = 'camera' | 'upload';

// Style untuk video mirror (menghilangkan efek cermin seperti pada registrasi)
const videoStyle = {
  transform: 'scaleX(-1)', // Mirror untuk konsistensi dengan registrasi
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const
};

// Style untuk canvas yang sesuai dengan video
const canvasStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transform: 'scaleX(-1)' // Mirror untuk konsistensi dengan registrasi
};

export default function RecognizeFaceClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [showRecognitionResult, setShowRecognitionResult] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    detectionTime: number;
    totalTime: number;
  } | null>(null);
  
  // Constant untuk real-time detection
  const REALTIME_DETECTION = true;

  // Memuat model face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        setIsModelLoaded(true);
        // Auto start camera when models are loaded
        startCamera();
      } catch (error) {
        console.error('Gagal memuat model:', error);
        setErrorMessage('Gagal memuat model deteksi wajah. Silakan muat ulang halaman.');
      }
    };
    
    loadModels();
    
    // Cleanup saat komponen di-unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsCameraActive(false);
      }
      
      // Clear detection interval jika masih aktif
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Mengaktifkan kamera
  const startCamera = async () => {
    try {
      // Gunakan resolusi persegi untuk menghindari distorsi
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user', // 'user' untuk kamera depan
          frameRate: { ideal: 30 }
        }
      });
      
      // Simpan referensi stream untuk dibersihkan nantinya
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setErrorMessage(null);
        
        // Mulai deteksi real-time setelah video dimuat
        videoRef.current.onloadedmetadata = () => {
          setupRealTimeDetection();
        };
      }
    } catch (error) {
      console.error('Gagal mengakses kamera:', error);
      setErrorMessage('Tidak dapat mengakses kamera. Pastikan kamera terhubung dan izin diberikan.');
      setIsCameraActive(false);
    }
  };
  
  // Setup deteksi real-time untuk landmark wajah
  const setupRealTimeDetection = () => {
    if (!REALTIME_DETECTION) return;
    
    // Clear previous interval if exists
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
    }
    
    // Run face detection at 10 FPS (100ms intervals)
    detectionIntervalRef.current = window.setInterval(async () => {
      if (!isModelLoaded || !videoRef.current || recognitionStatus === 'processing') return;
      
      try {
        // Gunakan detector options yang dioptimalkan
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320,  // Size lebih besar untuk akurasi landmark
          scoreThreshold: 0.55 // Threshold lebih ketat untuk akurasi lebih baik
        });
        
        // Deteksi wajah dan landmark saja (tanpa descriptor untuk performa)
        const result = await faceapi.detectSingleFace(
          videoRef.current, 
          detectorOptions
        ).withFaceLandmarks();
        
        if (result && canvasRef.current && videoRef.current) {
          // Pastikan dimensi canvas sesuai dengan video
          const displaySize = { 
            width: videoRef.current.videoWidth, 
            height: videoRef.current.videoHeight 
          };
          
          // Pastikan canvas memiliki ukuran yang benar
          if (canvasRef.current.width !== displaySize.width || 
              canvasRef.current.height !== displaySize.height) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
          }
          
          // Resize hasil deteksi ke ukuran canvas
          const resizedDetections = faceapi.resizeResults(result, displaySize);
          
          // Gambar hasil deteksi
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Konsisten dengan tampilan non-mirror
            ctx.save();
            
            // Buat landmark lebih terlihat dengan warna yang kontras
            ctx.strokeStyle = '#22c55e'; // Hijau yang lebih terlihat
            ctx.lineWidth = 2;
            
            // Gambar kotak deteksi dengan warna yang kontras
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            
            // Gambar landmark dengan opsi tampilan yang dioptimalkan
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            
            ctx.restore();
          }
        }
      } catch (error) {
        // Hanya log error pada real-time detection
        console.debug('Real-time detection error:', error);
      }
    }, 100); // 10 FPS
  };

  // Deteksi wajah dan dapatkan descriptor
  const detectFace = async (): Promise<{ descriptor: Float32Array, latencyMs: number } | null> => {
    if (!videoRef.current || !isModelLoaded) return null;
    
    const startTime = performance.now();
    
    try {
      // Pause real-time detection during processing
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
      
      // Lakukan beberapa upaya deteksi dengan parameter berbeda jika diperlukan
      let detections = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!detections && attempts < maxAttempts) {
        attempts++;
        
        // Sesuaikan parameter berdasarkan upaya
        // Percobaan pertama: parameter ideal
        // Percobaan berikutnya: lebih toleran
        const scoreThreshold = 0.65 - (attempts * 0.05); // 0.65, 0.6, 0.55 - lebih ketat pada awalnya
        
        // Gunakan ukuran input optimal untuk akurasi terbaik
        // Saat deteksi untuk absensi, kita prioritaskan akurasi di atas kecepatan
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 416, // Ukuran besar untuk akurasi maksimal saat verifikasi
          scoreThreshold: scoreThreshold // Menurunkan threshold pada setiap percobaan
        });
        
        // Proses video pada resolusi penuh untuk akurasi lebih baik
        const videoEl = videoRef.current;
        
        try {
          // Pre-processing - normalisasi pencahayaan jika ini bukan upaya pertama
          let inputElement = videoEl;
          
          if (attempts > 1) {
            // Buat canvas untuk pre-processing
            const preprocessCanvas = document.createElement('canvas');
            preprocessCanvas.width = videoEl.videoWidth;
            preprocessCanvas.height = videoEl.videoHeight;
            const ctx = preprocessCanvas.getContext('2d', { willReadFrequently: true });
            
            if (ctx) {
              // Gambar frame video ke canvas
              // Gunakan pendekatan flip horizontal jika perlu
              ctx.save();
              // Jangan lakukan flip di sini karena kita sudah menggunakan tampilan non-mirror
              ctx.drawImage(videoEl, 0, 0);
              ctx.restore();
              
              // Normalisasi pencahayaan pada upaya kedua dan ketiga
              if (attempts === 2) {
                // Sesuaikan kontras
                const imageData = ctx.getImageData(0, 0, preprocessCanvas.width, preprocessCanvas.height);
                const data = imageData.data;
                
                // Tingkatkan kontras secara sederhana
                const contrast = 1.2; // Nilai > 1 meningkatkan kontras
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                
                for (let i = 0; i < data.length; i += 4) {
                  // Rumus kontras: F(x) = factor * (x - 128) + 128
                  data[i] = factor * (data[i] - 128) + 128; // R
                  data[i+1] = factor * (data[i+1] - 128) + 128; // G
                  data[i+2] = factor * (data[i+2] - 128) + 128; // B
                }
                
                ctx.putImageData(imageData, 0, 0);
              } else if (attempts === 3) {
                // Coba grayscale + normalisasi jika upaya terakhir
                const imageData = ctx.getImageData(0, 0, preprocessCanvas.width, preprocessCanvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                  // Konversi ke grayscale menggunakan pembobotan luminance
                  const gray = 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
                  
                  // Tingkatkan brightness
                  const brightness = 30; 
                  const value = Math.min(255, gray + brightness);
                  
                  // Atur semua channel ke nilai yang sama (grayscale)
                  data[i] = data[i+1] = data[i+2] = value;
                }
                
                ctx.putImageData(imageData, 0, 0);
              }
              
              // Gunakan preprocessed canvas sebagai input
              inputElement = preprocessCanvas as unknown as HTMLVideoElement;
            }
          }
          
          // Deteksi dan ekstraksi descriptor - gunakan image yang sudah diproses
          detections = await faceapi.detectSingleFace(
            inputElement, 
            detectorOptions
          )
          .withFaceLandmarks()
          .withFaceDescriptor();
          
          // Clean up jika kita menggunakan canvas
          if (inputElement !== videoEl && inputElement instanceof HTMLCanvasElement) {
            // Canvas tidak terpasang di DOM jadi tidak perlu dihapus
            // Akan dibersihkan oleh garbage collector
          }
        } catch (innerError) {
          console.debug(`Attempt ${attempts} failed:`, innerError);
          // Lanjutkan ke percobaan berikutnya
          continue;
        }
      }
      
      const endTime = performance.now();
      const latencyMs = endTime - startTime;
      
      if (!detections) {
        throw new Error('Tidak ada wajah terdeteksi setelah beberapa upaya. Pastikan posisi wajah terlihat jelas dan cukup pencahayaan.');
      }
      
      // Tampilkan hasil deteksi final pada canvas
      if (canvasRef.current && videoRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Buat deteksi dan landmark terlihat jelas
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }
      }
      
      // Restart real-time detection setelah selesai
      setTimeout(() => {
        setupRealTimeDetection();
      }, 2000);
      
      setPerformanceMetrics({
        detectionTime: latencyMs,
        totalTime: 0 // Akan diupdate setelah API call
      });
      
      return {
        descriptor: detections.descriptor,
        latencyMs
      };
    } catch (error) {
      console.error('Kesalahan deteksi wajah:', error);
      
      // Restart real-time detection setelah error
      setTimeout(() => {
        setupRealTimeDetection();
      }, 1000);
      
      throw error;
    }
  };

  const captureImageForArcFace = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Proses pengenalan wajah
  const processRecognition = async () => {
    setRecognitionStatus('processing');
    setRecognitionResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const globalStartTime = performance.now();
    
    try {
      const result = await detectFace();
      
      if (!result) {
        throw new Error('Gagal mendeteksi wajah');
      }
      
      // Konversi Float32Array ke array biasa untuk JSON
      const descriptorArray = Array.from(result.descriptor);
      
      // Capture image for ArcFace recognition
      const currentImage = await captureImageForArcFace();
      
      // Try Face-API.js recognition first
      const payload = JSON.stringify({
        descriptor: descriptorArray,
        latencyMs: result.latencyMs
      });
      
      let faceApiResult = null;
      
      try {
        // Try Face-API.js recognition
        const response = await fetch('/api/recognize-face', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });
        
        if (response.ok) {
          faceApiResult = await response.json();
        }
      } catch (error) {
        console.warn('Face-API.js recognition failed:', error);
      }
      
      // Use Face-API.js result as the final result
      const finalResult = faceApiResult;
      
      const globalEndTime = performance.now();
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        detectionTime: prev?.detectionTime || 0,
        totalTime: globalEndTime - globalStartTime
      }));
      
      if (finalResult && finalResult.success) {
        setRecognitionStatus('success');
        setRecognitionResult(finalResult);
        setSuccessMessage(`Kehadiran berhasil dicatat untuk ${finalResult.match?.name}!`);
        setShowRecognitionResult(true);
      } else {
        setRecognitionStatus('error');
        setRecognitionResult({
          success: false,
          error: 'Wajah tidak dikenali oleh sistem'
        });
        setErrorMessage('Wajah tidak terdaftar dalam sistem atau tidak dapat dikenali');
      }
    } catch (error: unknown) {
      console.error('Kesalahan pengenalan:', error);
      const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan saat pengenalan wajah';
      setRecognitionStatus('error');
      setErrorMessage(errorMsg);
    }
  };

  // Reset recognition state
  const handleReset = () => {
    setShowRecognitionResult(false);
    setRecognitionStatus('idle');
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecognitionResult(null);
  };

  if (!isModelLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Memuat model deteksi wajah...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Professional Alerts Container - Enhanced */}
      <div className="max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4 border-red-200/70 bg-red-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            <AlertDescription className="text-red-800 font-medium text-sm md:text-base">{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4 border-green-200/70 bg-green-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium text-sm md:text-base">{successMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {!showRecognitionResult ? (
        // DASHBOARD MAIN CONTENT - Optimized Horizontal Layout
        <div className="flex-1 max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row gap-3 md:gap-4 h-full min-h-0">
            {/* LEFT PANEL - Optimized Camera Section */}
            <div className="flex-[7] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="bg-gray-900 h-full flex flex-col min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] lg:min-h-[65vh] xl:min-h-[calc(100vh-8rem)]">
                <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)} className="flex-1 flex flex-col h-full">
                  <TabsContent value="camera" className="flex-1 m-0 h-full">
                    <div className="relative flex-1 h-full">
                      {/* Status model */}
                      {!isModelLoaded && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-900/75 z-10">
                          <div className="text-white text-center">
                            <div className="mb-2">Memuat model AI...</div>
                            <div className="relative w-12 h-12 mx-auto">
                              <div className="absolute inset-0 rounded-full border-2 border-gray-600"></div>
                              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <video 
                        ref={videoRef} 
                        style={videoStyle}
                        className={`w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                        autoPlay 
                        playsInline 
                        muted
                      />
                      
                      <canvas 
                        ref={canvasRef} 
                        style={canvasStyle}
                      />
                      
                      {/* Spinner saat processing */}
                      {recognitionStatus === 'processing' && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-900/60 backdrop-blur-sm z-10">
                          <div className="text-white text-center">
                            <div className="mb-2">Memproses pengenalan wajah...</div>
                            <div className="relative w-12 h-12 mx-auto">
                              <div className="absolute inset-0 rounded-full border-2 border-gray-600"></div>
                              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay panduan kamera - Same as registration */}
                      {isCameraActive && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          {/* Overlay oval dengan opacity rendah untuk menunjukkan area wajah yang ideal */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                         w-3/4 h-5/6 border-2 border-white border-dashed rounded-full 
                                         flex items-center justify-center opacity-70">
                            <div className="text-white text-xs bg-black/50 px-2 py-1 rounded absolute -bottom-8">
                              Posisikan wajah di area ini
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Jika kamera belum aktif */}
                      {!isCameraActive && (
                        <div className="absolute inset-0 flex justify-center items-center">
                          <div className="text-gray-400 text-lg">Kamera tidak aktif</div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="flex-1 m-0 h-full p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                      <div className="text-center text-white">
                        <Upload className="h-12 w-12 mx-auto mb-4 opacity-60" />
                        <p className="text-sm opacity-80">Upload image untuk pengenalan wajah</p>
                        <p className="text-xs opacity-60 mt-2">Fitur akan segera tersedia</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* RIGHT PANEL - Responsive Dashboard Controls Card */}
            <div className="flex-[3] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 flex flex-col min-h-[40vh] sm:min-h-[35vh] md:min-h-[45vh] xl:min-h-[calc(100vh-8rem)] transition-all duration-300">
              <div className="p-3 sm:p-4 md:p-5 flex flex-col h-full">
                {/* Card Header - Responsive */}
                <div className="border-b border-gray-100 pb-2 md:pb-3 mb-3 md:mb-4">
                  <h3 className="text-sm md:text-base xl:text-lg font-semibold text-gray-900 mb-1">Kontrol Kamera</h3>
                  <p className="text-xs md:text-sm text-gray-600">Pilih metode pengenalan wajah</p>
                </div>

                {/* Method Selection Card - Enhanced Responsive */}
                <div className="mb-3 md:mb-4">
                  <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)}>
                    <TabsList className="grid grid-cols-2 w-full h-8 md:h-10 p-1 bg-gray-100 transition-all duration-200">
                      <TabsTrigger value="camera" className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Camera className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Camera</span>
                        <span className="sm:hidden">Cam</span>
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Upload className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">Up</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Instructions Card - Optimized for All Screen Sizes */}
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg md:rounded-xl transition-all duration-200">
                  <h4 className="font-medium text-blue-900 mb-1 md:mb-2 flex items-center text-xs md:text-sm">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Panduan Pengenalan
                  </h4>
                  <ul className="text-xs md:text-sm text-blue-800 space-y-1 md:space-y-1.5">
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Posisikan wajah di dalam lingkaran panduan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Wajah terlihat jelas dan pencahayaan cukup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Hindari gerakan berlebihan saat proses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Tekan tombol untuk memulai pengenalan</span>
                    </li>
                  </ul>
                </div>

                {/* Performance Metrics Display */}
                {performanceMetrics && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Metrik Performa</h4>
                    <div className="space-y-1 text-xs md:text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Deteksi:</span>
                        <span>{performanceMetrics.detectionTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{performanceMetrics.totalTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Button */}
                <div className="mb-3 md:mb-4">
                  {captureMode === 'camera' ? (
                    !isCameraActive ? (
                      <Button
                        onClick={startCamera}
                        disabled={recognitionStatus === 'processing'}
                        className="w-full h-10 md:h-12 text-sm md:text-base font-medium"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Aktifkan Kamera
                      </Button>
                    ) : (
                      <Button
                        onClick={processRecognition}
                        disabled={!isModelLoaded || recognitionStatus === 'processing'}
                        className="w-full h-10 md:h-12 text-sm md:text-base font-medium"
                      >
                        {recognitionStatus === 'processing' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mulai Pengenalan
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      disabled
                      className="w-full h-10 md:h-12 text-sm md:text-base font-medium opacity-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Foto (Segera Hadir)
                    </Button>
                  )}
                </div>

                {/* Status Card - Enhanced Responsive */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="p-2 md:p-3 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-100 rounded-lg border border-gray-200 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 mb-1">Status Sistem</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                          {recognitionStatus === 'processing' ? 'Memproses pengenalan wajah...' :
                           recognitionStatus === 'success' ? 'Berhasil dikenali!' :
                           recognitionStatus === 'error' ? 'Tidak dikenali' :
                           !isCameraActive ? 'Kamera tidak aktif' :
                           'Siap untuk pengenalan'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ml-2 flex-shrink-0 ${
                        recognitionStatus === 'processing' 
                          ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-200' 
                          : recognitionStatus === 'success' ? 'bg-green-400 shadow-lg shadow-green-200'
                          : recognitionStatus === 'error' ? 'bg-red-400 shadow-lg shadow-red-200'
                          : isCameraActive ? 'bg-blue-400 shadow-lg shadow-blue-200'
                          : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // RECOGNITION RESULT SCREEN - Full Screen Overlay like Register Form
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl border-gray-200/70 bg-white">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                {recognitionResult?.success ? (
                  <>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Pengenalan Berhasil!</h2>
                    <p className="text-sm text-gray-600">Selamat datang, {recognitionResult.match?.name}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Waktu: {new Date(recognitionResult.match?.timestamp || '').toLocaleString('id-ID')}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Pengenalan Gagal</h2>
                    <p className="text-sm text-gray-600">
                      {recognitionResult?.error || 'Wajah tidak terdaftar dalam sistem'}
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleReset}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open('/attendance', '_blank')}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Lihat Riwayat Kehadiran
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}