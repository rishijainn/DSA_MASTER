import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400, headers: corsHeaders() })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Exchange the PKCE code for tokens using service role
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401, headers: corsHeaders() })
    }

    return NextResponse.json({ session: data.session }, { headers: corsHeaders() })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}
