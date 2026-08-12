import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() { return handleOptions() }

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400, headers: corsHeaders() })
    }

    type CookieWithOptions = {
      name: string
      value: string
      options: Record<string, unknown>
    }

    const cookiesToSet: CookieWithOptions[] = []
    const responseHeaders: Record<string, string> = {}

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookies, headers) {
            cookiesToSet.push(...cookies)
            Object.assign(responseHeaders, headers)
          },
        },
      },
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const session = data.session
    if (!session) throw new Error('No session returned')

    const response = NextResponse.json(
      { success: true, user: data.user, session },
      { headers: { ...corsHeaders(), ...responseHeaders } },
    )
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    const status = typeof err === 'object' && err !== null && 'status' in err
      ? (err as { status?: number }).status ?? 500
      : 500

    console.error('[login]', err)
    return NextResponse.json(
      { error: msg },
      { status: status >= 400 && status < 600 ? status : 500, headers: corsHeaders() },
    )
  }
}