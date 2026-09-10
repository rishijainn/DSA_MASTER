import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'
import {
  normalizeTitle,
  cleanSlug,
  leetcodeSlugUrl,
  gfgSlugUrl,
  type ProblemSource,
} from '@/lib/normalize'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const CAP = 500 // max problems imported per call (run again to continue past this)

// next_review_date is NOT NULL in the database, so unreviewed imports get a
// far-future sentinel date: never enters the daily queue/streak/rank, and the
// row is identified as unreviewed by stability = 0 until its first review.
const UNREVIEWED_DATE = '9999-12-31'

interface IncomingProblem {
  slug?: unknown
  title?: unknown
  timestamp?: unknown
  difficulty?: unknown
  source?: unknown
  url?: unknown
}

interface CleanedProblem {
  normTitle: string
  title: string
  source: ProblemSource
  timestamp: number
  difficulty: string
  leetcodeSlug: string
  leetcodeUrl: string
  gfgSlug: string
  gfgUrl: string
}

function cleanProblem(p: IncomingProblem): CleanedProblem | null {
  const source: ProblemSource = p.source === 'gfg' ? 'gfg' : 'leetcode'
  const slug = cleanSlug(p.slug)
  if (!slug) return null

  const title = typeof p.title === 'string'
    ? p.title.replace(/[<>]/g, '').slice(0, 200)
    : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const normTitle = normalizeTitle(title)
  if (!normTitle) return null // a problem with no name can't be matched

  const timestamp = Number(p.timestamp)
  const difficulty = p.difficulty === 'easy' || p.difficulty === 'medium' || p.difficulty === 'hard'
    ? p.difficulty
    : 'easy'

  if (source === 'gfg') {
    const gfgUrl = typeof p.url === 'string'
      ? String(p.url).slice(0, 500)
      : gfgSlugUrl(slug)
    return {
      normTitle, title, source, timestamp,
      difficulty,
      leetcodeSlug: '',
      leetcodeUrl: '',
      gfgSlug: slug,
      gfgUrl,
    }
  }

  return {
    normTitle, title, source, timestamp,
    difficulty,
    leetcodeSlug: slug,
    leetcodeUrl: leetcodeSlugUrl(slug),
    gfgSlug: '',
    gfgUrl: '',
  }
}

// The dedupe identity across platforms is the normalized title: lowercase,
// punctuation + spacing stripped. On a collision keep the earliest-solved row
// (ties prefer LeetCode) and merge the loser's platform identity into the
// winner so no slug/url is lost and no duplicate is ever inserted. The winner
// keeps its own source (the platform it was solved on first).
function mergeIdentities(winner: CleanedProblem, loser: CleanedProblem): CleanedProblem {
  if (!winner.leetcodeSlug && loser.leetcodeSlug) {
    winner.leetcodeSlug = loser.leetcodeSlug
    winner.leetcodeUrl = loser.leetcodeUrl
  }
  if (!winner.gfgSlug && loser.gfgSlug) {
    winner.gfgSlug = loser.gfgSlug
    winner.gfgUrl = loser.gfgUrl
  }
  return winner
}

function earlierProblem(a: CleanedProblem, b: CleanedProblem): CleanedProblem {
  if (a.timestamp !== b.timestamp) return a.timestamp < b.timestamp ? a : b
  return a.source === 'leetcode' ? a : b // tie → prefer the LeetCode row
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

    // Dedupe within this batch by normalized title (earliest solve wins).
    const byNorm = new Map<string, CleanedProblem>()
    for (const raw of problems as IncomingProblem[]) {
      const p = cleanProblem(raw)
      if (!p) continue

      const existing = byNorm.get(p.normTitle)
      if (!existing) {
        byNorm.set(p.normTitle, p)
        continue
      }

      const winner = earlierProblem(existing, p)
      const loser = winner === existing ? p : existing
      byNorm.set(p.normTitle, mergeIdentities(winner, loser))
    }

    const unique = [...byNorm.values()].sort((a, b) => a.timestamp - b.timestamp)
    const importedMore = unique.length > CAP
    const batch = importedMore ? unique.slice(0, CAP) : unique

    if (batch.length === 0) {
      return NextResponse.json(
        { success: true, inserted: 0, duplicates: 0, already_tracked: 0, total: 0, imported_more: importedMore },
        { headers: corsHeaders() }
      )
    }

    // Dedupe against problems already tracked — matched by normalized title so
    // a LeetCode row also catches a GFG import of the same problem (and vice
    // versa), and an earlier GFG import catches a later one.
    const { data: existingRows, error: existingError } = await supabase
      .from('problems')
      .select('id, source, normalized_title, leetcode_slug, leetcode_url, gfg_slug, gfg_url, created_at')
      .eq('user_id', userId)
      .in('normalized_title', batch.map((p) => p.normTitle))

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500, headers: corsHeaders() })
    }

    const existingByNorm = new Map<string, (typeof existingRows)[number]>()
    for (const row of existingRows ?? []) {
      if (!row.normalized_title) continue // pre-migration rows can't match by title
      const current = existingByNorm.get(row.normalized_title)
      if (!current) {
        existingByNorm.set(row.normalized_title, row)
      } else {
        // legacy duplicates on the same title: prefer the LeetCode row, else the earliest
        const preferCurrent = current.source === 'leetcode' ||
          (row.source !== 'leetcode' && current.created_at <= row.created_at)
        if (!preferCurrent) existingByNorm.set(row.normalized_title, row)
      }
    }

    const toInsert: Array<Record<string, unknown>> = []
    const mergesByExistingId = new Map<string, Record<string, unknown>>()
    let alreadyTracked = 0

    for (const p of batch) {
      const existing = existingByNorm.get(p.normTitle)
      if (!existing) {
        toInsert.push({
          user_id: userId,
          source: p.source,
          leetcode_slug: p.leetcodeSlug || null,
          title: p.title,
          normalized_title: p.normTitle,
          // leetcode_url doubles as the generic "open problem" URL for the UI,
          // so GFG-only rows still get a working link until they gain an LC id.
          leetcode_url: p.leetcodeUrl || p.gfgUrl || null,
          gfg_slug: p.gfgSlug || null,
          gfg_url: p.gfgUrl || null,
          difficulty: p.difficulty,
          hint_used: false,
          felt_difficulty: null,
          stability: 0,
          next_review_date: UNREVIEWED_DATE,
          last_reviewed_at: null,
          review_count: 0,
        })
        continue
      }

      // Already tracked. Merge the incoming platform's identity into the kept
      // row when it's missing, so a cross-platform hit records both slugs/urls.
      alreadyTracked++
      const merge: Record<string, unknown> = { id: existing.id }
      if (p.leetcodeSlug && !existing.leetcode_slug) {
        merge.leetcode_slug = p.leetcodeSlug
        merge.leetcode_url = p.leetcodeUrl
      }
      if (p.gfgSlug && !existing.gfg_slug) {
        merge.gfg_slug = p.gfgSlug
        merge.gfg_url = p.gfgUrl
      }
      if (Object.keys(merge).length > 1) {
        const prev = mergesByExistingId.get(existing.id)
        mergesByExistingId.set(existing.id, prev ? { ...prev, ...merge } : merge)
      }
    }

    let inserted = 0
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('problems').insert(toInsert)

      // fallback: felt_difficulty may be NOT NULL in this database
      if (insertError && /felt_difficulty|null value in column/i.test(insertError.message)) {
        const { error: retryError } = await supabase
          .from('problems')
          .insert(toInsert.map((r) => ({ ...r, felt_difficulty: 'medium' })))
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500, headers: corsHeaders() })
        }
      } else if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders() })
      }

      inserted = toInsert.length
    }

    if (mergesByExistingId.size > 0) {
      const { error: mergeError } = await supabase
        .from('problems')
        .upsert([...mergesByExistingId.values()], { onConflict: 'id' })
      if (mergeError) {
        return NextResponse.json({ error: mergeError.message }, { status: 500, headers: corsHeaders() })
      }
    }

    const duplicates = batch.length - inserted

    return NextResponse.json(
      {
        success: true,
        inserted,
        duplicates,
        already_tracked: alreadyTracked,
        total: unique.length,
        imported_more: importedMore,
      },
      { headers: corsHeaders() }
    )
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}