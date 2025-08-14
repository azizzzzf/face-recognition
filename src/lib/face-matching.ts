import { KnownFace } from '@/generated/prisma';

// Interface untuk struktur deskriptor wajah
interface FaceDescriptorMap {
  [id: string]: {
    id: string;
    name: string;
    descriptor: Float32Array;
  };
}

// Cache untuk deskriptor
let faceDescriptors: FaceDescriptorMap = {};
let isInitialized = false;

/**
 * Mengkonversi array biasa menjadi Float32Array untuk perhitungan yang lebih efisien
 */
export function toFloat32Array(array: number[]): Float32Array {
  return new Float32Array(array);
}

/**
 * Menghitung jarak Euclidean antara dua descriptor
 * dengan optimasi untuk kecepatan
 */
export function calculateEuclideanDistance(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[]
): number {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Kedua descriptor harus tersedia');
  }

  const desc1 = descriptor1 instanceof Float32Array ? descriptor1 : toFloat32Array(descriptor1);
  const desc2 = descriptor2 instanceof Float32Array ? descriptor2 : toFloat32Array(descriptor2);

  // Implementasi Euclidean distance yang dioptimasi
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff; // Lebih cepat dari Math.pow(diff, 2)
  }
  return Math.sqrt(sum);
}

/**
 * Menghitung jarak L2 (cosine distance) antara dua descriptor
 * dengan normalisasi untuk akurasi lebih tinggi
 */
export function calculateL2Distance(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[]
): number {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Kedua descriptor harus tersedia');
  }

  const desc1 = descriptor1 instanceof Float32Array ? descriptor1 : toFloat32Array(descriptor1);
  const desc2 = descriptor2 instanceof Float32Array ? descriptor2 : toFloat32Array(descriptor2);

  // Implementasi dengan normalisasi L2
  let norm1 = 0, norm2 = 0, dotProduct = 0;
  
  for (let i = 0; i < desc1.length; i++) {
    norm1 += desc1[i] * desc1[i];
    norm2 += desc2[i] * desc2[i];
    dotProduct += desc1[i] * desc2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) {
    return 1.0; // Jarak maksimum
  }
  
  // Cosine similarity = dotProduct / (norm1 * norm2)
  // Ubah ke jarak untuk konsistensi (1 - similarity)
  return 1.0 - (dotProduct / (norm1 * norm2));
}

/**
 * Memuat descriptor wajah ke memori untuk pencocokan cepat
 */
export async function loadFaceDescriptors(faces: KnownFace[]): Promise<void> {
  faceDescriptors = {};
  
  for (const face of faces) {
    faceDescriptors[face.id] = {
      id: face.id,
      name: face.name,
      descriptor: toFloat32Array(face.faceApiDescriptor),
    };
  }
  
  isInitialized = true;
}

/**
 * Mencari kecocokan terbaik berdasarkan descriptor
 * dengan threshold yang dioptimalkan untuk akurasi >95%
 */
export function findBestMatch(
  descriptor: number[],
  threshold: number = 0.10, // Threshold ketat berdasarkan analisis data: max distance untuk valid match
  excludeUserId?: string // Optional: exclude specific user from matching (for benchmark testing)
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

  // Gunakan L2 distance normalisasi untuk akurasi lebih tinggi
  const queryDesc = toFloat32Array(descriptor);
  
  // Cari jarak terkecil (kecocokan terbaik)
  let excludedCount = 0;
  for (const faceId of faceIds) {
    const face = faceDescriptors[faceId];
    
    // Skip if this user should be excluded (for benchmark testing)
    if (excludeUserId && face.id === excludeUserId) {
      excludedCount++;
      continue;
    }
    
    // Gunakan L2 distance untuk akurasi lebih baik
    const distance = calculateL2Distance(queryDesc, face.descriptor);
    const similarity = 1 - distance;
    
    if (distance < bestMatch.distance) {
      bestMatch = {
        userId: face.id,
        name: face.name,
        distance,
        similarity: 1 - distance
      };
    }
  }
  
  // Log summary for debugging if needed
  console.log(`Face matching: checked ${faceIds.length - excludedCount}/${faceIds.length} users, best: ${bestMatch.name} (${(bestMatch.similarity * 100).toFixed(1)}%)`);

  // Verifikasi jika kecocokan berada di bawah threshold (lebih ketat)
  if (bestMatch.distance > threshold) {
    return null;
  }
  
  // Return genuine similarity score without artificial scaling
  // This ensures accurate benchmark comparison with ArcFace
  bestMatch.similarity = bestMatch.similarity; 

  return bestMatch;
}

/**
 * Mengecek apakah descriptor sudah dimuat ke memori
 */
export function isDescriptorsLoaded(): boolean {
  return isInitialized;
}

/**
 * Reset cache descriptor
 */
export function resetDescriptors(): void {
  faceDescriptors = {};
  isInitialized = false;
} 