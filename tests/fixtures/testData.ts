export const testUsers = {
  admin: {
    id: 'test-admin-id',
    email: 'admin@test.com',
    password: 'AdminPass123!',
    name: 'Admin Test User',
    role: 'ADMIN' as const,
    supabaseId: 'test-admin-supabase-id'
  },
  user: {
    id: 'test-user-id', 
    email: 'user@test.com',
    password: 'UserPass123!',
    name: 'Regular Test User',
    role: 'USER' as const,
    supabaseId: 'test-user-supabase-id'
  },
  userWithFace: {
    id: 'test-user-face-id',
    email: 'userface@test.com', 
    password: 'UserFacePass123!',
    name: 'Test User With Face',
    role: 'USER' as const,
    supabaseId: 'test-user-face-supabase-id'
  },
  userNoAccess: {
    id: 'test-user-no-access-id',
    email: 'noaccess@test.com',
    password: 'NoAccessPass123!', 
    name: 'Test User No Access',
    role: 'USER' as const,
    supabaseId: 'test-user-no-access-supabase-id'
  }
};

export const testFaceDescriptors = {
  valid: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  invalid: Array.from({ length: 64 }, () => Math.random()),
  empty: [],
  malformed: 'not-an-array'
};

export const testImages = {
  validFace: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  invalidFormat: 'invalid-image-data',
  tooLarge: 'data:image/jpeg;base64,' + 'A'.repeat(10000000), // 10MB mock
  noFace: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
};

export const testAttendanceRecords = [
  {
    id: 'attendance-1',
    faceId: 'test-face-id',
    similarity: 0.95,
    latencyMs: 120,
    model: 'face-api',
    createdAt: new Date('2024-01-01T09:00:00Z')
  },
  {
    id: 'attendance-2', 
    faceId: 'test-face-id',
    similarity: 0.88,
    latencyMs: 95,
    model: 'face-api',
    createdAt: new Date('2024-01-02T09:15:00Z')
  },
  {
    id: 'attendance-3',
    faceId: 'test-face-id',
    similarity: 0.92,
    latencyMs: 110,
    model: 'face-api', 
    createdAt: new Date('2024-01-03T08:45:00Z')
  }
];

export const mockApiResponses = {
  successfulLogin: {
    success: true,
    data: {
      user: testUsers.user,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600
      }
    }
  },
  failedLogin: {
    success: false,
    error: 'Invalid credentials'
  },
  registeredUsers: {
    success: true,
    data: [
      {
        id: testUsers.user.id,
        name: testUsers.user.name,
        email: testUsers.user.email,
        registeredAt: '2024-01-01T00:00:00Z',
        hasFaceRegistration: false
      },
      {
        id: testUsers.userWithFace.id,
        name: testUsers.userWithFace.name, 
        email: testUsers.userWithFace.email,
        registeredAt: '2024-01-01T00:00:00Z',
        hasFaceRegistration: true,
        faceRegistration: {
          id: 'test-face-id',
          registeredAt: '2024-01-02T00:00:00Z',
          hasValidDescriptor: true
        }
      }
    ]
  },
  faceStatus: {
    hasAccount: true,
    hasFaceRegistration: true,
    canAccessAttendance: true,
    user: testUsers.userWithFace,
    faceRegistration: {
      id: 'test-face-id',
      registeredAt: '2024-01-02T00:00:00Z',
      hasValidDescriptor: true
    },
    attendanceStats: {
      totalRecords: 3,
      lastAttendance: '2024-01-03T08:45:00Z'
    }
  }
};

export const errorScenarios = {
  networkError: new Error('Network request failed'),
  timeoutError: new Error('Request timeout'),
  serverError: { status: 500, message: 'Internal server error' },
  unauthorized: { status: 401, message: 'Unauthorized' },
  forbidden: { status: 403, message: 'Forbidden' },
  notFound: { status: 404, message: 'Not found' },
  validationError: { status: 400, message: 'Validation failed' }
};

export const performanceBenchmarks = {
  pageLoad: 3000,     // 3 seconds
  apiResponse: 500,   // 500ms
  faceRecognition: 1000, // 1 second
  modelLoading: 10000,   // 10 seconds
  cameraInit: 2000       // 2 seconds
};