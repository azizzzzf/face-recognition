interface KnownFace {
  id: string;
  name: string;
  faceApiDescriptor: number[];
}

interface FaceMatch {
  userId: string;
  name: string;
  distance: number;
  similarity: number;
}

const faceDescriptors: Map<string, { name: string; descriptor: number[] }> = new Map();
let descriptorsLoaded = false;

export function isDescriptorsLoaded(): boolean {
  return descriptorsLoaded;
}

export async function loadFaceDescriptors(knownFaces: KnownFace[]): Promise<void> {
  faceDescriptors.clear();
  
  for (const face of knownFaces) {
    if (face.faceApiDescriptor && Array.isArray(face.faceApiDescriptor) && face.faceApiDescriptor.length === 128) {
      faceDescriptors.set(face.id, {
        name: face.name,
        descriptor: face.faceApiDescriptor
      });
    }
  }
  
  descriptorsLoaded = true;
  console.log(`Loaded ${faceDescriptors.size} face descriptors into memory`);
}

export function findBestMatch(targetDescriptor: number[], threshold: number): FaceMatch | null {
  if (!descriptorsLoaded || faceDescriptors.size === 0) {
    return null;
  }

  let bestMatch: FaceMatch | null = null;
  let minDistance = Infinity;

  for (const [userId, { name, descriptor }] of faceDescriptors.entries()) {
    const distance = euclideanDistance(targetDescriptor, descriptor);
    
    if (distance < minDistance && distance < threshold) {
      minDistance = distance;
      bestMatch = {
        userId,
        name,
        distance,
        similarity: 1 - distance // Convert distance to similarity score
      };
    }
  }

  return bestMatch;
}

function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}