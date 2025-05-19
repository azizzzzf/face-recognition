'use client';

import { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import LazyAttendanceTable from './LazyAttendanceTable';
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    detectionTime: number;
    totalTime: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('camera');
  
  // State untuk pengaturan video
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  
  // Ref untuk menyimpan canvas filter
  const filterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
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
      // Gunakan resolusi persegi untuk menghindari distorsi
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user',
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
            
            // Buat landmark lebih terlihat dengan warna hitam-putih
            ctx.strokeStyle = '#FFFFFF';
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
      
      // Lakukan beberapa upaya deteksi dengan parameter berbeda jika diperlukan
      let detections = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!detections && attempts < maxAttempts) {
        attempts++;
        
        // Sesuaikan parameter berdasarkan upaya
        // Percobaan pertama: parameter ideal
        // Percobaan berikutnya: lebih toleran
        const scoreThreshold = 0.7 - (attempts * 0.1); // 0.7, 0.6, 0.5
        
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
              ctx.drawImage(videoEl, 0, 0);
              
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

  // Fungsi untuk menerapkan filter pada video
  const applyVideoFilters = () => {
    const video = videoRef.current;
    if (!video || !isCameraActive) return;
    
    // Buat canvas filter jika belum ada
    if (!filterCanvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      filterCanvasRef.current = canvas;
    }
    
    const canvas = filterCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Pastikan dimensi canvas sesuai dengan video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Gambar frame dari video ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Hanya terapkan filter jika nilai tidak default
    if (brightness !== 100 || contrast !== 100) {
      // Ambil data gambar
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Faktor normalisasi
      const brightnessF = brightness / 100;
      const contrastF = contrast / 100;
      
      // Terapkan brightness dan contrast
      for (let i = 0; i < data.length; i += 4) {
        // Brightness - perkalian sederhana
        data[i] = data[i] * brightnessF;     // R
        data[i + 1] = data[i + 1] * brightnessF; // G
        data[i + 2] = data[i + 2] * brightnessF; // B
        
        // Contrast
        if (contrast !== 100) {
          // Formula kontras: F(x) = (x - 128) * contrast/100 + 128
          data[i] = (data[i] - 128) * contrastF + 128;     // R
          data[i + 1] = (data[i + 1] - 128) * contrastF + 128; // G
          data[i + 2] = (data[i + 2] - 128) * contrastF + 128; // B
        }
        
        // Pastikan nilai tetap dalam range 0-255
        data[i] = Math.min(255, Math.max(0, data[i]));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
      }
      
      // Terapkan perubahan
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Tampilkan hasil filter di canvas utama
    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      const mainCtx = mainCanvas.getContext('2d');
      if (mainCtx) {
        // Hanya gambar layer filter, tidak termasuk anotasi deteksi wajah
        mainCtx.drawImage(canvas, 0, 0, mainCanvas.width, mainCanvas.height);
      }
    }
    
    // Panggil fungsi ini lagi pada frame berikutnya
    requestAnimationFrame(applyVideoFilters);
  };

  // Efek untuk memulai filter saat kamera aktif
  useEffect(() => {
    if (isCameraActive) {
      // Mulai proses filter
      requestAnimationFrame(applyVideoFilters);
    } else {
      // Bersihkan canvas filter saat kamera dimatikan
      if (filterCanvasRef.current) {
        const ctx = filterCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, filterCanvasRef.current.width, filterCanvasRef.current.height);
        }
      }
    }
  }, [isCameraActive, brightness, contrast]);

  // Komponen pengaturan video
  const renderVideoSettings = () => {
    if (!showVideoSettings) return null;
    
    return (
      <div className="mt-4 p-4 bg-muted border border-border rounded-md">
        <h3 className="text-sm font-medium mb-3">Pengaturan Kamera</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Kecerahan: {brightness}%</label>
            <Slider 
              min={50}
              max={150}
              value={brightness}
              onChange={setBrightness}
            />
          </div>
          
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Kontras: {contrast}%</label>
            <Slider 
              min={50}
              max={150}
              value={contrast}
              onChange={setContrast}
            />
          </div>
        </div>
        
        <button 
          onClick={() => { setBrightness(100); setContrast(100); }}
          className="mt-3 text-xs bg-muted-foreground/20 hover:bg-muted-foreground/30 px-2 py-1 rounded-md"
        >
          Reset ke Default
        </button>
      </div>
    );
  };

  const renderControls = () => (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <button
        onClick={startCamera}
        disabled={isProcessing}
        className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
      >
        Aktifkan Kamera
      </button>
      
      <button
        onClick={processRecognition}
        disabled={!isModelLoaded || !isCameraActive || isProcessing}
        className="bg-card hover:bg-muted text-foreground border border-border py-2.5 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Memproses...' : 'Check In'}
      </button>
      
      {isCameraActive && (
        <button
          onClick={() => setShowVideoSettings(!showVideoSettings)}
          className="text-sm text-muted-foreground hover:text-foreground font-medium"
        >
          {showVideoSettings ? 'Sembunyikan Pengaturan Kamera' : 'Tampilkan Pengaturan Kamera'}
        </button>
      )}
      
      {renderVideoSettings()}
    </div>
  );

  const renderResult = () => {
    if (!recognitionResult) return null;
    
    return (
      <div className="mt-6 p-4 rounded-md border border-border bg-muted/50 w-full">
        <h3 className="text-lg font-semibold mb-2">
          {recognitionResult.success ? 'Wajah Dikenali' : 'Hasil Scan'}
        </h3>
        
        {recognitionResult.success && recognitionResult.match ? (
          <div>
            <div className="space-y-2 mb-4">
              <p><span className="font-medium">Nama:</span> {recognitionResult.match.name}</p>
              <p><span className="font-medium">Kecocokan:</span> {(recognitionResult.match.similarity * 100).toFixed(2)}%</p>
              <p><span className="font-medium">Waktu:</span> {new Date(recognitionResult.match.timestamp).toLocaleString()}</p>
            </div>
            <div className="py-2 px-3 bg-muted rounded border-l-4 border-primary text-foreground">
              Kehadiran berhasil tercatat! ✓
            </div>
            
            {performanceMetrics && (
              <div className="mt-4 pt-2 border-t border-border text-xs text-muted-foreground">
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
          <p className="text-destructive">{recognitionResult.error || 'Wajah tidak dikenali'}</p>
        )}
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    // Tambahkan panduan khusus berdasarkan jenis error
    let guidanceMessage: React.ReactNode = null;
    if (errorMessage.includes("Tidak ada wajah terdeteksi")) {
      guidanceMessage = (
        <div className="mt-2 text-foreground">
          <p className="font-semibold mb-1">Tips untuk pengenalan wajah yang lebih baik:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Pastikan wajah Anda berada di tengah layar</li>
            <li>Hindari cahaya yang terlalu terang dari belakang (silau)</li>
            <li>Cari tempat dengan pencahayaan yang cukup dan merata</li>
            <li>Jangan terlalu dekat atau terlalu jauh dari kamera</li>
            <li>Pastikan wajah Anda tidak terhalangi (rambut, masker, dll)</li>
          </ul>
        </div>
      );
    }
    
    return (
      <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive w-full">
        <p className="font-medium">{errorMessage}</p>
        {guidanceMessage}
      </div>
    );
  };

  // Tampilan overlay panduan
  const renderCameraGuide = () => {
    if (!isCameraActive) return null;
    
    return (
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Overlay oval dengan opacity rendah untuk menunjukkan area wajah yang ideal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-3/4 h-5/6 border-2 border-primary border-dashed rounded-full 
                       flex items-center justify-center opacity-70">
          <div className="text-white text-xs bg-background/50 px-2 py-1 rounded absolute -bottom-8">
            Posisikan wajah di area ini
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6" defaultValue="camera">
        <TabsList className="mx-auto">
          <TabsTrigger value="camera">Kamera</TabsTrigger>
          <TabsTrigger value="logs">Riwayat Absensi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="mt-4">
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="lg:w-6/12 mb-6 lg:mb-0">
              <div className="relative aspect-square max-w-md mx-auto lg:max-w-none bg-background rounded-lg overflow-hidden border border-border">
                {/* Status model */}
                {!isModelLoaded && (
                  <div className="absolute inset-0 flex justify-center items-center bg-background/75 z-10">
                    <div className="text-foreground text-center">
                      <div className="mb-2">Memuat model AI...</div>
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                  autoPlay 
                  playsInline 
                  muted
                />
                
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full"
                />
                
                {/* Spinner saat processing */}
                {isProcessing && (
                  <div className="absolute inset-0 flex justify-center items-center bg-background/60 backdrop-blur-sm z-10">
                    <div className="text-foreground text-center">
                      <div className="mb-2">Memproses...</div>
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Overlay panduan kamera */}
                {renderCameraGuide()}
                
                {/* Jika kamera belum aktif */}
                {!isCameraActive && (
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="text-muted-foreground text-lg">Kamera tidak aktif</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:w-6/12">
              <div className="bg-card p-5 rounded-lg border border-border">
                {renderControls()}
                {renderResult()}
                {renderErrorMessage()}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-4">
          <LazyAttendanceTable />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
        <p>Pastikan wajah Anda terlihat jelas dalam area panduan</p>
        {!isModelLoaded && <p className="text-amber-600">Memuat model deteksi wajah...</p>}
        {!isCameraActive && isModelLoaded && (
          <p className="text-amber-600">Mengaktifkan kamera...</p>
        )}
      </div>
    </div>
  );
} 