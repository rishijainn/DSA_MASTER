import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// Simple in-memory rate limiter: max 10 attempts per IP per 5 minutes
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 })
    return true
  }

  if (entry.count >= 10) return false

  entry.count++
  return true
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of attempts) {
    if (now > val.resetAt) attempts.delete(key)
  }
}, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 5 minutes.' },
        { status: 429, headers: corsHeaders(request) }
      )
    }

    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400, headers: corsHeaders(request) })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('api_token', token)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders(request) })

    return NextResponse.json({ success: true }, { headers: corsHeaders(request) })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}
