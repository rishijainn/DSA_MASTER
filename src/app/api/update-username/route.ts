import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    const clean = typeof username === 'string' ? username.trim() : ''
    if (!clean) {
      return NextResponse.json({ error: "Name can't be empty" }, { status: 400, headers: corsHeaders() })
    }
    if (clean.length > 32) {
      return NextResponse.json({ error: 'Name must be 32 characters or fewer' }, { status: 400, headers: corsHeaders() })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await admin
      .from('user_settings')
      .select('user_id')
      .eq('username', clean)
      .maybeSingle()

    if (existing && existing.user_id !== user.id) {
      return NextResponse.json({ error: 'That name is already taken' }, { status: 409, headers: corsHeaders() })
    }

    const { error } = await admin
      .from('user_settings')
      .update({ username: clean })
      .eq('user_id', user.id)

    if (error) {
      console.error('[update-username]', error)
      return NextResponse.json({ error: 'Failed to save name' }, { status: 500, headers: corsHeaders() })
    }

    return NextResponse.json({ success: true, username: clean }, { headers: corsHeaders() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    console.error('[update-username]', err)
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders() })
  }
}
