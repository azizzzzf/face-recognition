import { User } from '@supabase/supabase-js'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface AppUser {
  id: string
  email: string
  name: string
  role: Role
  supabaseId: string
}

export async function getUserBySupabaseId(supabaseId: string): Promise<AppUser | null> {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
  })

  return user
}

export async function createOrUpdateUser(supabaseUser: User, userData?: { name?: string, role?: Role }): Promise<AppUser> {
  const existingUser = await getUserBySupabaseId(supabaseUser.id)
  
  if (existingUser) {
    // Update existing user
    if (userData) {
      const updatedUser = await prisma.user.update({
        where: { supabaseId: supabaseUser.id },
        data: {
          name: userData.name || existingUser.name,
          role: userData.role || existingUser.role,
        },
      })
      return updatedUser
    }
    return existingUser
  }

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email: supabaseUser.email!,
      name: userData?.name || supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
      role: userData?.role || Role.USER,
      supabaseId: supabaseUser.id,
    },
  })

  return newUser
}

export function hasPermission(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole)
}

export function canAccessRoute(userRole: Role, route: string): boolean {
  const routePermissions: Record<string, Role[]> = {
    '/admin': [Role.ADMIN],
    '/users': [Role.ADMIN],
    '/register': [Role.ADMIN],
    '/recognize': [Role.USER, Role.ADMIN],
    '/attendance': [Role.USER, Role.ADMIN],
  }

  const requiredRoles = routePermissions[route]
  if (!requiredRoles) return true // Public route
  
  return hasPermission(userRole, requiredRoles)
}