import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateNextReview, findAvailableDate, type FeltDifficulty } from '@/lib/fsrs'
import { corsHeaders, handleOptions } from '@/lib/cors'
import { updateStreak } from '@/lib/streak'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
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
    const { slug, url: rawUrl, title, hint_used, felt_difficulty, difficulty } = body

    if (!slug || !rawUrl || !title || hint_used === undefined || !felt_difficulty || !difficulty) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders(request) })
    }

    // Validate and sanitize inputs
    const cleanSlug = String(slug).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 100)
    const cleanTitle = String(title).replace(/[<>]/g, '').slice(0, 200)
    const cleanUrl = String(rawUrl).replace(/\/submissions\/.*$/, '/').slice(0, 500)
    const validDifficulties = ['easy', 'medium', 'hard']
    const cleanDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'easy'
    const cleanHintUsed = Boolean(hint_used)
    const validFeltDifficulties: FeltDifficulty[] = ['easy', 'medium', 'hard', 'forgot']
    const cleanFeltDifficulty: FeltDifficulty = validFeltDifficulties.includes(felt_difficulty) ? felt_difficulty : 'medium'

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: corsHeaders(request) })
    }

    // check if problem already exists
    const { data: existing } = await supabase
      .from('problems')
      .select('id, review_count, stability')
      .eq('user_id', userId)
      .eq('leetcode_slug', cleanSlug)
      .maybeSingle()

    if (existing) {
      const { newStability, nextReviewDate: idealDate } = calculateNextReview({
        stability: existing.stability,
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

      await supabase
        .from('problems')
        .update({
          hint_used: cleanHintUsed,
          felt_difficulty: cleanFeltDifficulty,
          stability: newStability,
          next_review_date: nextReviewDate,
          last_reviewed_at: new Date().toISOString(),
          review_count: existing.review_count + 1
        })
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

    const { error: insertError } = await supabase.from('problems').insert({
      user_id: userId,
      leetcode_slug: cleanSlug,
      title: cleanTitle,
      leetcode_url: cleanUrl,
      difficulty: cleanDifficulty,
      hint_used: cleanHintUsed,
      felt_difficulty: cleanFeltDifficulty,
      stability: newStability,
      next_review_date: nextReviewDate,
      last_reviewed_at: new Date().toISOString(),
      review_count: 0
    })

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