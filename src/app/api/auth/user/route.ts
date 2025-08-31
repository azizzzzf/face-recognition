import { NextRequest, NextResponse } from 'next/server'
import { getUserBySupabaseId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { supabaseId } = await request.json()
    
    if (!supabaseId) {
      return NextResponse.json({ error: 'Missing supabaseId' }, { status: 400 })
    }

    const user = await getUserBySupabaseId(supabaseId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}