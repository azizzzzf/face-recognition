'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as faceapi from '@vladmandic/face-api';

interface FormData {
  name: string;
}

type RegistrationStatus = 'idle' | 'processing' | 'success' | 'error';

export default function RegisterFace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Path ke model
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
    };
  }, []);
  
  // Aktifkan kamera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Gagal mengakses kamera:', error);
      setErrorMessage('Tidak dapat mengakses kamera. Pastikan kamera terhubung dan izin diberikan.');
      setIsCameraActive(false);
    }
  };
  
  // Deteksi wajah dan dapatkan descriptor
  const detectFace = async (): Promise<Float32Array | null> => {
    if (!videoRef.current || !isModelLoaded) return null;
    
    try {
      // Deteksi wajah dengan TinyFaceDetector
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        throw new Error('Tidak ada wajah terdeteksi');
      }
      
      // Tampilkan kotak wajah dan landmark pada canvas
      if (canvasRef.current && videoRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);
        }
      }
      
      return detection.descriptor;
    } catch (error) {
      console.error('Kesalahan deteksi wajah:', error);
      throw error;
    }
  };
  
  // Proses pendaftaran
  const onSubmit = async (data: FormData) => {
    setRegistrationStatus('processing');
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Deteksi wajah
      const descriptor = await detectFace();
      
      if (!descriptor) {
        throw new Error('Gagal mendeteksi wajah. Pastikan wajah Anda terlihat jelas di kamera.');
      }
      
      // Konversi Float32Array ke array biasa untuk JSON
      const descriptorArray = Array.from(descriptor);
      
      // Kirim data ke API
      const response = await fetch('/api/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          descriptor: descriptorArray
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal mendaftarkan wajah');
      }
      
      // Sukses
      setRegistrationStatus('success');
      setSuccessMessage(`Pendaftaran wajah untuk ${data.name} berhasil!`);
      reset(); // Reset form
      
      // Bersihkan canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (error: unknown) {
      console.error('Kesalahan pendaftaran:', error);
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat pendaftaran wajah');
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded w-full max-w-md">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded w-full max-w-md">
          {successMessage}
        </div>
      )}
      
      <div className="relative mb-6 w-full max-w-md">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-lg shadow-lg"
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-md space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-4 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Masukkan nama Anda"
            {...register('name', { 
              required: 'Nama wajib diisi',
              minLength: { value: 2, message: 'Nama minimal 2 karakter' }
            })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!isModelLoaded || !isCameraActive || registrationStatus === 'processing'}
          className={`w-full py-2 px-4 text-white font-medium rounded-md 
            ${(!isModelLoaded || !isCameraActive || registrationStatus === 'processing') 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {registrationStatus === 'processing' 
            ? 'Mendaftarkan...' 
            : 'Daftarkan Wajah'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Sistem Pendaftaran Wajah</p>
        <p>Pastikan wajah Anda terlihat jelas di kamera</p>
        {!isModelLoaded && <p className="text-amber-600">Memuat model deteksi wajah...</p>}
        {!isCameraActive && isModelLoaded && (
          <p className="text-amber-600">Mengaktifkan kamera...</p>
        )}
      </div>
    </div>
  );
} 