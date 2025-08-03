import * as faceapi from '@vladmandic/face-api';
import { KnownFace } from '@/generated/prisma';

// Fungsi untuk mengkonversi array ke Float32Array untuk perhitungan yang lebih efisien
export function toFloat32Array(array: number[]): Float32Array {
  return new Float32Array(array);
}

// Fungsi untuk menghitung jarak Euclidean antara dua deskriptor
export function calculateEuclideanDistance(
  descriptor1: Float32Array | number[], 
  descriptor2: Float32Array | number[]
): number {
  // Pastikan kedua input tersedia
  if (!descriptor1 || !descriptor2) {
    throw new Error('Kedua descriptor harus tersedia');
  }

  // Convert to Float32Array if needed
  const desc1 = descriptor1 instanceof Float32Array ? descriptor1 : toFloat32Array(descriptor1);
  const desc2 = descriptor2 instanceof Float32Array ? descriptor2 : toFloat32Array(descriptor2);

  return faceapi.euclideanDistance(desc1, desc2);
}

// Menyimpan deskriptor wajah dalam memori untuk pencocokan yang cepat
interface FaceDescriptorMap {
  [id: string]: {
    id: string;
    name: string;
    descriptor: Float32Array;
  };
}

// Cache untuk menyimpan descriptor
let faceDescriptors: FaceDescriptorMap = {};
let isInitialized = false;

// Fungsi untuk memuat seluruh descriptor wajah ke memori
export async function loadFaceDescriptors(faces: KnownFace[]): Promise<void> {
  faceDescriptors = {};
  
  // Konversi dan simpan descriptor
  for (const face of faces) {
    faceDescriptors[face.id] = {
      id: face.id,
      name: face.name,
      descriptor: toFloat32Array(face.faceApiDescriptor),
    };
  }
  
  isInitialized = true;
}

// Fungsi untuk mencari kecocokan terbaik
export function findBestMatch(
  descriptor: number[], 
  threshold: number = 0.6
): { userId: string; name: string; distance: number; similarity: number } | null {
  if (!isInitialized) {
    throw new Error('Face descriptors belum dimuat ke memori');
  }

  const faceIds = Object.keys(faceDescriptors);
  if (faceIds.length === 0) {
    return null;
  }

  let bestMatch = {
    userId: '',
    name: '',
    distance: Number.MAX_VALUE,
    similarity: 0
  };

  // Cari jarak terkecil (kecocokan terbaik)
  for (const faceId of faceIds) {
    const face = faceDescriptors[faceId];
    const distance = calculateEuclideanDistance(descriptor, face.descriptor);
    
    if (distance < bestMatch.distance) {
      bestMatch = {
        userId: face.id,
        name: face.name,
        distance,
        similarity: 1 - distance
      };
    }
  }

  // Verifikasi jika kecocokan berada di bawah threshold
  if (bestMatch.distance > threshold) {
    return null;
  }

  return bestMatch;
}

// Flag untuk melacak status inisialisasi
export function isDescriptorsLoaded(): boolean {
  return isInitialized;
}

// Reset descriptor cache (berguna untuk pengujian)
export function resetDescriptors(): void {
  faceDescriptors = {};
  isInitialized = false;
} 