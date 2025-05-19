'use client';

import { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import LazyAttendanceTable from './LazyAttendanceTable';

interface RecognitionResult {
  success: boolean;
  match?: {
    userId: string;
    name: string;
    similarity: number;
    timestamp: string;
  };
  error?: string;
}

export default function RecognizeFace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shouldRefreshLogs, setShouldRefreshLogs] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    detectionTime: number;
    totalTime: number;
  } | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  
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
        console.log('Model deteksi wajah berhasil dimuat');
        
        // Aktifkan kamera setelah model dimuat
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
      // Minimalkan resolusi untuk performa lebih baik
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 } // frameRate lebih tinggi untuk deteksi real-time
        }
      });
      
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
      if (!isModelLoaded || !videoRef.current || isProcessing) return;
      
      try {
        // Gunakan detector options yang dioptimalkan
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320,  // Size lebih besar untuk akurasi landmark
          scoreThreshold: 0.6 // Threshold lebih rendah untuk mendeteksi wajah dari berbagai sudut
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
            
            // Buat landmark lebih terlihat
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            
            // Gambar kotak deteksi dengan warna yang kontras
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            
            // Gambar landmark dengan opsi tampilan yang dioptimalkan
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
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
      
      // Gunakan ukuran input optimal untuk akurasi terbaik
      // Saat deteksi untuk absensi, kita prioritaskan akurasi di atas kecepatan
      const detectorOptions = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 416, // Ukuran lebih besar untuk akurasi maksimal saat verifikasi
        scoreThreshold: 0.7 // Threshold tinggi untuk mengurangi false positive
      });
      
      // Proses video pada resolusi penuh untuk akurasi lebih baik
      const videoEl = videoRef.current;
      
      // Deteksi dan ekstraksi descriptor - gunakan video langsung untuk akurasi maksimal
      const detections = await faceapi.detectSingleFace(
        videoEl, 
        detectorOptions
      )
      .withFaceLandmarks()
      .withFaceDescriptor();
      
      const endTime = performance.now();
      const latencyMs = endTime - startTime;
      
      if (!detections) {
        throw new Error('Tidak ada wajah terdeteksi');
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

  // Proses pengenalan wajah
  const processRecognition = async () => {
    setIsProcessing(true);
    setRecognitionResult(null);
    setErrorMessage(null);
    
    const globalStartTime = performance.now();
    
    try {
      const result = await detectFace();
      
      if (!result) {
        throw new Error('Gagal mendeteksi wajah');
      }
      
      // Konversi Float32Array ke array biasa untuk JSON
      const descriptorArray = Array.from(result.descriptor);
      
      // Buat payload JSON
      const payload = JSON.stringify({
        descriptor: descriptorArray,
        latencyMs: result.latencyMs
      });
      
      try {
        // Kirim ke API
        const response = await fetch('/api/recognize-face', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          throw new Error('Gagal memproses respons dari server');
        }
        
        const globalEndTime = performance.now();
        
        // Update performance metrics
        setPerformanceMetrics(prev => ({
          detectionTime: prev?.detectionTime || 0,
          totalTime: globalEndTime - globalStartTime
        }));
        
        if (!response.ok) {
          if (response.status === 404) {
            setRecognitionResult({
              success: false,
              error: 'Wajah tidak dikenali'
            });
          } else {
            throw new Error(data.error || 'Error mengenali wajah');
          }
        } else {
          setRecognitionResult(data);
          setShouldRefreshLogs(true);
        }
      } catch (fetchError) {
        console.error('Kesalahan komunikasi dengan server:', fetchError);
        throw new Error('Gagal terhubung dengan server pengenalan wajah');
      }
    } catch (error: unknown) {
      console.error('Kesalahan pengenalan:', error);
      const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan saat pengenalan wajah';
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderControls = () => (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mb-4">
      <button
        onClick={startCamera}
        disabled={isProcessing}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition disabled:opacity-50"
      >
        Aktifkan Kamera
      </button>
      
      <button
        onClick={processRecognition}
        disabled={!isModelLoaded || !isCameraActive || isProcessing}
        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition disabled:opacity-50"
      >
        {isProcessing ? 'Memproses...' : 'Check In'}
      </button>
    </div>
  );

  const renderResult = () => {
    if (!recognitionResult) return null;
    
    return (
      <div className="mt-6 p-4 rounded shadow-md border border-gray-200 w-full max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-2">
          {recognitionResult.success ? 'Wajah Dikenali' : 'Hasil Scan'}
        </h3>
        
        {recognitionResult.success && recognitionResult.match ? (
          <div>
            <p><span className="font-medium">Nama:</span> {recognitionResult.match.name}</p>
            <p><span className="font-medium">Kecocokan:</span> {(recognitionResult.match.similarity * 100).toFixed(2)}%</p>
            <p><span className="font-medium">Waktu:</span> {new Date(recognitionResult.match.timestamp).toLocaleString()}</p>
            <p className="mt-2 text-green-600 font-medium">Kehadiran berhasil tercatat! ✓</p>
            
            {performanceMetrics && (
              <div className="mt-4 pt-2 border-t text-xs text-gray-500">
                <p>Waktu deteksi: {performanceMetrics.detectionTime.toFixed(2)} ms</p>
                <p>Waktu total: {performanceMetrics.totalTime.toFixed(2)} ms</p>
                <p className={performanceMetrics.totalTime < 200 ? 'text-green-500' : 'text-amber-500'}>
                  {performanceMetrics.totalTime < 200 
                    ? '✓ Performa baik (< 200ms)' 
                    : '⚠️ Performa lambat (> 200ms)'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">{recognitionResult.error || 'Wajah tidak dikenali'}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded w-full max-w-md">
          {errorMessage}
        </div>
      )}
      
      <div className="relative mb-4 w-full max-w-md">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              // Set canvas dimensions precisely to match video
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
        />
      </div>
      
      {renderControls()}
      {renderResult()}
      
      <LazyAttendanceTable key={shouldRefreshLogs ? 'refresh' : 'initial'} />
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Sistem Absensi dengan Face Recognition</p>
        <p>Pastikan wajah Anda terlihat jelas di kamera</p>
        {!isModelLoaded && <p className="text-amber-600">Memuat model deteksi wajah...</p>}
        {!isCameraActive && isModelLoaded && (
          <p className="text-amber-600">Mengaktifkan kamera...</p>
        )}
      </div>
    </div>
  );
} 