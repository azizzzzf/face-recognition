import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUser } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { supabaseId, email, name, role } = await request.json()
    
    if (!supabaseId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create a mock Supabase user object for the function
    const supabaseUser: {
      id: string;
      email: string;
      user_metadata: { name: string };
    } = {
      id: supabaseId,
      email,
      user_metadata: { name }
    }

    const userData = {
      name,
      role: role === 'ADMIN' ? Role.ADMIN : Role.USER
    }

    const user = await createOrUpdateUser(supabaseUser, userData)
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}