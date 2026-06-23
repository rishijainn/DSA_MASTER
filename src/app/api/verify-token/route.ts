import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400, headers: corsHeaders() })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('api_token', token)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders() })

    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}