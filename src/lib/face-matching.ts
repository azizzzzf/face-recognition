interface KnownFace {
  id: string;
  name: string;
  faceApiDescriptor: number[]; // Ensure consistent number array type
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
      // Ensure all values are properly converted to numbers
      const normalizedDescriptor = face.faceApiDescriptor.map(val => {
        const num = typeof val === 'number' ? val : Number(val);
        return isNaN(num) ? 0 : num; // Handle any NaN values
      });
      
      faceDescriptors.set(face.id, {
        name: face.name,
        descriptor: normalizedDescriptor
      });
      
      console.log(`Loaded face descriptor for ${face.name} (ID: ${face.id}) with ${normalizedDescriptor.length} dimensions`);
    } else {
      console.warn(`Skipping invalid face descriptor for ${face.name} (ID: ${face.id}): descriptor length = ${face.faceApiDescriptor?.length || 'undefined'}`);
    }
  }
  
  descriptorsLoaded = true;
  console.log(`Successfully loaded ${faceDescriptors.size} face descriptors into memory`);
}

export function findBestMatch(targetDescriptor: number[], threshold: number): FaceMatch | null {
  if (!descriptorsLoaded || faceDescriptors.size === 0) {
    console.log('Face descriptors not loaded or empty');
    return null;
  }

  console.log(`Finding best match among ${faceDescriptors.size} stored faces with threshold ${threshold}`);

  let bestMatch: FaceMatch | null = null;
  let minDistance = Infinity;
  const matchResults: {name: string, distance: number, similarity: number}[] = [];

  // Normalize target descriptor
  const normalizedTarget = targetDescriptor.map(val => {
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? 0 : num;
  });

  for (const [userId, { name, descriptor }] of faceDescriptors.entries()) {
    try {
      const distance = euclideanDistance(normalizedTarget, descriptor);
      
      // Convert distance to similarity score - improved calculation
      // Using a more realistic similarity conversion for face recognition
      const similarity = Math.max(0, 1 - (distance / 4)); // Adjust divisor based on typical face descriptor ranges
      
      matchResults.push({ name, distance, similarity });
      
      if (distance < minDistance && distance < threshold) {
        minDistance = distance;
        bestMatch = {
          userId,
          name,
          distance,
          similarity
        };
      }
    } catch (error) {
      console.warn(`Error calculating distance for face ${name}:`, error);
    }
  }

  // Log all match attempts for debugging
  console.log('Match results:');
  matchResults
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5) // Show top 5 matches
    .forEach(result => {
      console.log(`  ${result.name}: distance=${result.distance.toFixed(4)}, similarity=${(result.similarity * 100).toFixed(1)}%`);
    });

  if (bestMatch) {
    console.log(`Best match found: ${bestMatch.name} with distance ${bestMatch.distance.toFixed(4)} and similarity ${(bestMatch.similarity * 100).toFixed(1)}%`);
  } else {
    console.log(`No match found within threshold ${threshold}`);
  }

  return bestMatch;
}

function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Invalid descriptors: one or both descriptors are null/undefined');
  }
  
  if (descriptor1.length !== descriptor2.length) {
    throw new Error(`Descriptors must have the same length. Got ${descriptor1.length} and ${descriptor2.length}`);
  }
  
  if (descriptor1.length !== 128) {
    throw new Error(`Expected descriptor length of 128, got ${descriptor1.length}`);
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const val1 = descriptor1[i];
    const val2 = descriptor2[i];
    
    // Validate numeric values
    if (typeof val1 !== 'number' || typeof val2 !== 'number' || isNaN(val1) || isNaN(val2)) {
      throw new Error(`Non-numeric values found at index ${i}: ${val1}, ${val2}`);
    }
    
    const diff = val1 - val2;
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}