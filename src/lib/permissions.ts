import { Role } from '@prisma/client'

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // Admin only routes
  '/users': [Role.ADMIN],
  '/register': [Role.ADMIN],
  
  // User and Admin routes
  '/recognize': [Role.USER, Role.ADMIN],
  '/attendance': [Role.USER, Role.ADMIN],
  
  // Public routes (empty array means accessible to all authenticated users)
  '/': [],
  '/dashboard': [],
}

export const API_PERMISSIONS: Record<string, Role[]> = {
  // Admin only APIs
  '/api/users': [Role.ADMIN],
  '/api/users/bulk': [Role.ADMIN],
  '/api/users/registered': [Role.ADMIN],
  '/api/register-face': [Role.ADMIN],
  
  // User and Admin APIs  
  '/api/recognize-face': [Role.USER, Role.ADMIN],
  '/api/logs': [Role.ADMIN], // Admin sees all logs
  '/api/stats': [Role.ADMIN], // Admin sees all stats
  '/api/users/face-status': [Role.USER, Role.ADMIN], // User can check own face status
  '/api/users/personal-attendance': [Role.USER, Role.ADMIN], // User sees personal attendance
  
  // Specific user data (will be filtered by middleware)
  '/api/users/[id]': [Role.USER, Role.ADMIN],
  '/api/users/[id]/attendance': [Role.USER, Role.ADMIN],
}

export function hasPermission(userRole: Role, requiredRoles: Role[]): boolean {
  if (requiredRoles.length === 0) return true // Public route
  return requiredRoles.includes(userRole)
}

export function getRequiredRoles(path: string): Role[] {
  // Check exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path]
  }
  
  // Check for dynamic routes
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (matchesRoute(path, route)) {
      return roles
    }
  }
  
  // Default to public if no match
  return []
}

export function getAPIRequiredRoles(path: string): Role[] {
  // Check exact match first
  if (API_PERMISSIONS[path]) {
    return API_PERMISSIONS[path]
  }
  
  // Check for dynamic routes
  for (const [route, roles] of Object.entries(API_PERMISSIONS)) {
    if (matchesRoute(path, route)) {
      return roles
    }
  }
  
  // Default to admin only for unmatched API routes
  return [Role.ADMIN]
}

function matchesRoute(actualPath: string, routePattern: string): boolean {
  // Convert route pattern to regex
  // /api/users/[id] -> /api/users/[^/]+
  const pattern = routePattern
    .replace(/\[([^\]]+)\]/g, '[^/]+')
    .replace(/\//g, '\\/')
  
  const regex = new RegExp(`^${pattern}$`)
  return regex.test(actualPath)
}