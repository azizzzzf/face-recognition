"use client";

import { AlertTriangle, Camera, RefreshCw, Shield, Info } from "lucide-react";
import { Button } from "@/ui/button";

interface CameraErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
}

export function CameraError({ error, onRetry, onDismiss, retryCount = 0 }: CameraErrorProps) {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('kamera') || errorMessage.includes('camera')) {
      return 'camera_access';
    }
    if (errorMessage.includes('HTTPS') || errorMessage.includes('https')) {
      return 'https_required';
    }
    return 'general';
  };

  const getErrorDetails = (errorMessage: string) => {
    const type = getErrorType(errorMessage);
    
    switch (type) {
      case 'camera_access':
        return {
          title: 'Akses Kamera Ditolak',
          description: 'Aplikasi membutuhkan akses ke kamera untuk mengambil foto wajah.',
          suggestions: [
            'Klik ikon kamera di address bar browser dan pilih "Allow"',
            'Pastikan kamera tidak sedang digunakan aplikasi lain',
            'Refresh halaman dan coba lagi'
          ],
          icon: Camera,
          color: 'blue'
        };
      case 'https_required':
        return {
          title: 'Koneksi Tidak Aman',
          description: 'Browser memerlukan koneksi HTTPS untuk akses kamera.',
          suggestions: [
            'Pastikan URL menggunakan https://',
            'Gunakan localhost untuk development',
            'Hubungi administrator jika masalah berlanjut'
          ],
          icon: Shield,
          color: 'yellow'
        };
      default:
        return {
          title: 'Terjadi Kesalahan',
          description: 'Ada masalah dengan sistem kamera.',
          suggestions: [
            'Refresh halaman dan coba lagi',
            'Periksa koneksi internet Anda',
            'Coba gunakan browser berbeda'
          ],
          icon: AlertTriangle,
          color: 'red'
        };
    }
  };

  const errorDetails = getErrorDetails(error);
  const IconComponent = errorDetails.icon;

  return (
    <div className="absolute inset-4 z-20 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${
            errorDetails.color === 'blue' ? 'text-blue-500' :
            errorDetails.color === 'yellow' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            <IconComponent className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {errorDetails.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              {errorDetails.description}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Cara mengatasi:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {errorDetails.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-gray-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {retryCount > 0 && (
              <div className="mb-3 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                Percobaan ke-{retryCount}. Jika masalah berlanjut, coba refresh halaman.
              </div>
            )}

            <div className="flex space-x-3">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {retryCount >= 3 ? 'Terlalu Banyak Percobaan' : 'Coba Lagi'}
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Tutup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}