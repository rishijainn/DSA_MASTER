import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() { return handleOptions() }

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400, headers: corsHeaders() })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: settings, error } = await admin
      .from('user_settings')
      .select('user_id')
      .eq('username', username)
      .single()

    if (error || !settings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders() })
    }

    const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(settings.user_id)
    if (authErr || !authUser?.user?.email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404, headers: corsHeaders() })
    }

    return NextResponse.json({ email: authUser.user.email }, { headers: corsHeaders() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    console.error('[resolve-username]', err)
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders() })
  }
}