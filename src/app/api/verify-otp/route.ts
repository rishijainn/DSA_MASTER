import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, username, password, dailyCommitment } = await request.json()
    if (!email || !code || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders() })
    }

    // Server client for auth verification (uses cookies)
    const supabase = await createClient()

    // Verify OTP
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (verifyError || !verifyData?.user) {
      return NextResponse.json({ error: verifyError?.message ?? 'Invalid or expired OTP' }, { status: 400, headers: corsHeaders() })
    }

    const user = verifyData.user
    const userId = user.id

    // Admin client for writing profile and setting user password (service role)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Ensure the OTP-created user can later sign in with email/password.
    const { error: passwordError } = await admin.auth.admin.updateUserById(userId, {
      password,
    })

    if (passwordError) {
      console.error('[verify-otp] set password failed:', passwordError)
      return NextResponse.json({ error: 'Failed to set password' }, { status: 500, headers: corsHeaders() })
    }

    // Upsert profile data
    const { error: settingsError } = await admin
      .from('user_settings')
      .upsert({
        user_id: userId,
        username,
        daily_commitment: dailyCommitment ?? 5,
      })

    if (settingsError) {
      console.error('[verify-otp] profile upsert failed:', settingsError)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500, headers: corsHeaders() })
    }

    // Get session from verification (verifyOtp returns session)
    const session = verifyData.session
    if (!session) {
      return NextResponse.json({ error: 'No session returned' }, { status: 500, headers: corsHeaders() })
    }

    // Set proper Supabase auth cookies for middleware
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    const accessTokenCookie = projectRef ? `sb-${projectRef}-auth-token` : 'sb-access-token'
    const refreshTokenCookie = projectRef ? `sb-${projectRef}-auth-token.0` : 'sb-refresh-token'

    const response = NextResponse.json({ success: true, user, session }, { headers: corsHeaders() })
    response.cookies.set(accessTokenCookie, session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in,
    })
    response.cookies.set(refreshTokenCookie, session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    console.error('[verify-otp]', error)
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() })
  }
}