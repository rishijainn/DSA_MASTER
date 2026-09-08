import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const CAP = 500 // max problems imported per call (run again to continue past this)

interface IncomingProblem {
  slug?: unknown
  title?: unknown
  timestamp?: unknown
  difficulty?: unknown
}

function cleanProblem(p: IncomingProblem) {
  const slug = typeof p.slug === 'string'
    ? p.slug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 100)
    : ''
  if (!slug) return null

  const title = typeof p.title === 'string'
    ? p.title.replace(/[<>]/g, '').slice(0, 200)
    : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const timestamp = Number(p.timestamp)
  const difficulty = p.difficulty === 'easy' || p.difficulty === 'medium' || p.difficulty === 'hard'
    ? p.difficulty
    : 'easy'

  return { slug, title, timestamp: Number.isFinite(timestamp) ? Math.max(0, timestamp) : 0, difficulty }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401, headers: corsHeaders() })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('api_token', token)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders(request) })
    }

    const userId = settings.user_id

    const body = await request.json()
    const problems: unknown = body?.problems
    if (!Array.isArray(problems)) {
      return NextResponse.json({ error: 'problems must be an array' }, { status: 400, headers: corsHeaders(request) })
    }

    // validate + de-dupe by slug in this batch (earliest solve wins)
    const bySlug = new Map<string, { slug: string; title: string; timestamp: number; difficulty: string }>()
    for (const raw of problems as IncomingProblem[]) {
      const p = cleanProblem(raw)
      if (!p) continue
      const existing = bySlug.get(p.slug)
      if (!existing || p.timestamp < existing.timestamp) bySlug.set(p.slug, p)
    }

    const unique = [...bySlug.values()].sort((a, b) => a.timestamp - b.timestamp)
    const importedMore = unique.length > CAP
    const batch = importedMore ? unique.slice(0, CAP) : unique

    if (batch.length === 0) {
      return NextResponse.json(
        { success: true, inserted: 0, duplicates: 0, total: 0, imported_more: importedMore },
        { headers: corsHeaders() }
      )
    }

    // dedupe against problems already tracked
    const { data: existingRows, error: existingError } = await supabase
      .from('problems')
      .select('leetcode_slug')
      .eq('user_id', userId)
      .in('leetcode_slug', batch.map((p) => p.slug))

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500, headers: corsHeaders() })
    }

    const tracked = new Set((existingRows ?? []).map((r) => r.leetcode_slug))
    const toInsert = batch.filter((p) => !tracked.has(p.slug))

    let inserted = 0
    if (toInsert.length > 0) {
      const rows = toInsert.map((p) => ({
        user_id: userId,
        leetcode_slug: p.slug,
        title: p.title,
        leetcode_url: `https://leetcode.com/problems/${p.slug}/`,
        difficulty: p.difficulty,
        hint_used: false,
        felt_difficulty: null,
        stability: 0,
        next_review_date: null,
        last_reviewed_at: null,
        review_count: 0,
      }))

      const { error: insertError } = await supabase.from('problems').insert(rows)

      // fallback: felt_difficulty may be NOT NULL in this database
      if (insertError && /felt_difficulty|null value in column/i.test(insertError.message)) {
        const { error: retryError } = await supabase
          .from('problems')
          .insert(rows.map((r) => ({ ...r, felt_difficulty: 'medium' })))
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500, headers: corsHeaders() })
        }
      } else if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders() })
      }

      inserted = toInsert.length
    }

    const duplicates = batch.length - inserted

    return NextResponse.json(
      {
        success: true,
        inserted,
        duplicates,
        total: unique.length,
        imported_more: importedMore,
      },
      { headers: corsHeaders() }
    )
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}