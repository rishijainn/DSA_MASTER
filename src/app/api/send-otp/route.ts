import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400, headers: corsHeaders() })
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders() })
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch (err: any) {
    console.error('[send-otp] error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}