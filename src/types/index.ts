// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Face Recognition Types
export interface FaceDescriptor {
  id: string;
  name: string;
  descriptor: number[];
  confidence?: number;
}

export interface FaceMatch {
  name: string;
  distance: number;
  similarity: number;
  confidence: number;
}

export interface RecognitionResult {
  match: FaceMatch | null;
  confidence: number;
  processed: boolean;
}


// User Types
export interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnownFace {
  id: string;
  name: string;
  faceApiDescriptor: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: Date;
  user?: User;
}

// Component Props Types
export interface MultiAngleCaptureProps {
  onCapture: (images: string[]) => void;
  requiredAngles: number;
  isCapturing: boolean;
}

export interface FaceRecognitionProps {
  onRecognition: (result: RecognitionResult) => void;
  threshold?: number;
}

// Form Types
export interface RegisterFormData {
  name: string;
  images: string[];
}

export interface RecognizeFormData {
  image: string;
  threshold: number;
}