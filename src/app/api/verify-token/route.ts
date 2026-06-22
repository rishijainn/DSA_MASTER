import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('api_token', token)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}