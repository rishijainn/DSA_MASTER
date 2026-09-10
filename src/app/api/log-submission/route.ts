import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateNextReview, findAvailableDate, type FeltDifficulty } from '@/lib/fsrs'
import { corsHeaders, handleOptions } from '@/lib/cors'
import { updateStreak } from '@/lib/streak'
import { normalizeTitle, cleanSlug, type ProblemSource } from '@/lib/normalize'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// A problem is matched (cross-platform) by its normalized title — same identity
// rule as /api/import. Incoming solves that match an existing row are treated
// as a review of that row, and the solver's platform slug/url is merged in so a
// problem tracked on LeetCode can still be reviewed when solved on GFG.
interface ExistingRow {
  id: string
  source?: string
  leetcode_slug?: string | null
  gfg_slug?: string | null
  normalized_title?: string | null
  review_count: number
  stability: number
}

function pickMatch(
  candidates: ExistingRow[] | null,
  source: ProblemSource,
  cleanSlugValue: string,
  normTitle: string
): ExistingRow | null {
  let best: ExistingRow | null = null
  let bestScore = 4
  for (const c of candidates ?? []) {
    const samePlatformSlug = source === 'leetcode' ? c.leetcode_slug : c.gfg_slug
    const otherPlatformSlug = source === 'leetcode' ? c.gfg_slug : c.leetcode_slug

    let score: number
    if (samePlatformSlug === cleanSlugValue) score = 0
    else if (c.normalized_title === normTitle) score = 1
    else if (otherPlatformSlug === cleanSlugValue) score = 2
    else continue // no identity match (shouldn't be in the candidate set)

    if (score < bestScore || (score === bestScore && best && c.source === 'leetcode')) {
      bestScore = score
      best = c
    }
  }
  return best
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
      .select('user_id, daily_commitment')
      .eq('api_token', token)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders() })
    }

    const userId = settings.user_id
    const dailyCommitment = settings.daily_commitment ?? 5

    const body = await request.json()
    const { slug, url: rawUrl, title, hint_used, felt_difficulty, difficulty, source } = body

    if (!slug || !rawUrl || !title || hint_used === undefined || !felt_difficulty || !difficulty) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders(request) })
    }

    // Validate and sanitize inputs
    const cleanSource: ProblemSource = source === 'gfg' ? 'gfg' : 'leetcode'
    const cleanSlugValue = cleanSlug(slug)
    const cleanTitle = String(title).replace(/[<>]/g, '').slice(0, 200)
    const cleanUrl = String(rawUrl).replace(/\/submissions\/.*$/, '/').slice(0, 500)
    const normTitle = normalizeTitle(cleanTitle)
    const validDifficulties = ['easy', 'medium', 'hard']
    const cleanDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'easy'
    const cleanHintUsed = Boolean(hint_used)
    const validFeltDifficulties: FeltDifficulty[] = ['easy', 'medium', 'hard', 'forgot']
    const cleanFeltDifficulty: FeltDifficulty = validFeltDifficulties.includes(felt_difficulty) ? felt_difficulty : 'medium'

    if (!cleanSlugValue) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: corsHeaders(request) })
    }

    // Match the existing problem: same-platform slug, cross-platform slug, or
    // the normalized title (which is how LeetCode ↔ GFG versions align).
    const { data: candidates, error: lookupError } = await supabase
      .from('problems')
      .select('id, source, leetcode_slug, gfg_slug, normalized_title, review_count, stability')
      .eq('user_id', userId)
      .or(`leetcode_slug.eq.${cleanSlugValue},gfg_slug.eq.${cleanSlugValue},normalized_title.eq.${normTitle}`)
      .limit(50)

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500, headers: corsHeaders() })
    }

    const existing = pickMatch(candidates, cleanSource, cleanSlugValue, normTitle)

    if (existing) {
      // Imported backlog rows sit at stability 0 until first review — treat their
      // first review as a fresh solve so FSRS ramps up from 1 instead of 0.
      const baseStability =
        existing.review_count === 0 && existing.stability === 0 ? 1 : existing.stability

      const { newStability, nextReviewDate: idealDate } = calculateNextReview({
        stability: baseStability,
        feltDifficulty: cleanFeltDifficulty,
        hintUsed: cleanHintUsed
      })

      const nextReviewDate = await findAvailableDate(
        idealDate,
        userId,
        dailyCommitment,
        supabase,
        existing.id
      )

      const updateFields: Record<string, unknown> = {
        hint_used: cleanHintUsed,
        felt_difficulty: cleanFeltDifficulty,
        stability: newStability,
        next_review_date: nextReviewDate,
        last_reviewed_at: new Date().toISOString(),
        review_count: existing.review_count + 1
      }

      // Cross-platform solve: record the other platform's identity on the kept
      // row (never creates a duplicate).
      if (cleanSource === 'gfg' && !existing.gfg_slug) {
        updateFields.gfg_slug = cleanSlugValue
        updateFields.gfg_url = cleanUrl
      }
      if (cleanSource === 'leetcode' && !existing.leetcode_slug) {
        updateFields.leetcode_slug = cleanSlugValue
        updateFields.leetcode_url = cleanUrl
      }

      await supabase
        .from('problems')
        .update(updateFields)
        .eq('id', existing.id)

      await supabase.from('review_logs').insert({
        problem_id: existing.id,
        user_id: userId,
        hint_used: cleanHintUsed,
        felt_difficulty: cleanFeltDifficulty
      })

      // Re-solve of existing problem = review → always check streak
      await updateStreak(userId, supabase)

      return NextResponse.json({ success: true, next_review_date: nextReviewDate }, { headers: corsHeaders() })
    }

    // new problem
    const { newStability, nextReviewDate: idealDate } = calculateNextReview({
      stability: 1,
      feltDifficulty: cleanFeltDifficulty,
      hintUsed: cleanHintUsed
    })

    const nextReviewDate = await findAvailableDate(
      idealDate,
      userId,
      dailyCommitment,
      supabase,
      undefined,
      true
    )

    const insertRow: Record<string, unknown> = {
      user_id: userId,
      source: cleanSource,
      title: cleanTitle,
      normalized_title: normTitle,
      // leetcode_url doubles as the generic "open problem" link for the UI;
      // GFG-only rows get the GFG url until they gain an LC identity.
      leetcode_url: cleanUrl,
      difficulty: cleanDifficulty,
      hint_used: cleanHintUsed,
      felt_difficulty: cleanFeltDifficulty,
      stability: newStability,
      next_review_date: nextReviewDate,
      last_reviewed_at: new Date().toISOString(),
      review_count: 0
    }

    if (cleanSource === 'gfg') {
      insertRow.gfg_slug = cleanSlugValue
      insertRow.gfg_url = cleanUrl
      insertRow.leetcode_slug = ''
    } else {
      insertRow.leetcode_slug = cleanSlugValue
      insertRow.gfg_slug = ''
    }

    const { error: insertError } = await supabase.from('problems').insert(insertRow)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders() })
    }

    // New problem → streak only counts if zero reviews were due today.
    // updateStreak checks this internally (dueCount vs todayReviews).
    await updateStreak(userId, supabase)

    return NextResponse.json({ success: true, next_review_date: nextReviewDate }, { headers: corsHeaders() })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() })
  }
}